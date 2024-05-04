'use strict';

const DATABASE_KEYNAME = 'unimap';

const winston = require.main.require('winston');
const utils = require.main.require('./src/utils');
const meta = require.main.require('./src/meta');
const db = require.main.require('./src/database');
const posts = require.main.require('./src/posts');
const topics = require.main.require('./src/topics');
const privileges = require.main.require('./src/privileges');
const inputValidator = require('./inputValidator');
const imageUploader = require('./imageUploader');



function isValidPlace(place) {
    const requiredFields = ['placeTitle', 'placeCategory', 'latlng'];
    return requiredFields.every(field => place.hasOwnProperty(field) && place[field]);
}

module.exports.reImportPlaces = async function(req, res, helpers) {
    const newPlaces = req.body.newPlaces;
    if (!Array.isArray(newPlaces) || !newPlaces.every(isValidPlace)) {
        helpers.formatApiResponse(400, res, { error: "Provided newPlaces data is not valid!", details: {} });
        return;
    }

    try {
        await db.setObject(DATABASE_KEYNAME + ':places', newPlaces);
        helpers.formatApiResponse(200, res, { status: "success", newPlaces });
    } catch (error) {
         winston.error("Failed to import new places", error);
        helpers.formatApiResponse(500, res, { error: "Internal server error", details: {} });
    }
};


module.exports.handleAddPlaceRequest = async function (req, res, helpers) {
    const notice = {}; // For collecting notifications and errors
    winston.level = 'verbose'; // TODO: remove

    try {
        const settings = await meta.settings.get(DATABASE_KEYNAME)
        const fields = inputValidator.inspectForm(req.body, utils);

        if (!fields.placeTitle || !req.uid) {
            helpers.formatApiResponse(200, res, { error: "Fields are not valid!", details: fields });
            return;
        }

        const topicTags = [settings.placeTopicTag, fields.city, fields.placeCategory];
        if (fields.socialtype) topicTags.push(fields.socialtype);
        if (fields.eventWeekDay) topicTags.push(fields.eventWeekDay);
        const topicData = { title: fields.placeTitle, content: fields.placeDescription, tags: topicTags };

        let topic;
        let oldFields;

        if (fields.tid) {
            notice.edit = 'Edit post';
            const editAttempt = await editTopic(fields.tid, topicData, req.uid);
            if (editAttempt.error) {
                notice.editerr = ' - ' + editAttempt.error;
            } else {
                topic = await topics.getTopicData(fields.tid);
                oldFields = await db.getObjectField(DATABASE_KEYNAME+':places', fields.tid);
            }

            if (!topic) {
                helpers.formatApiResponse(200, res, { error: `Can't edit topic ${fields.tid}`, notice });
                winston.error(`Failed to edit topic: ${fields.tid}`);
                return;
            }

            fields.edited = Math.floor(Date.now() / 1000);
            fields.edited_by = req.uid;
            fields.placethumb = oldFields?.placethumb;
            fields.pic = oldFields?.pic;
            fields.gallery = oldFields?.gallery;
            if(fields.mainImage !== oldFields?.mainImage){
                winston.verbose(`TODO: map. reassociate thumb ${fields.mainImage} tid ${fields.tid}`)
                fields.placethumb = fields.gallery ? fields.gallery[Number(fields.mainImage)] : oldFields?.placethumb
            }

        } else {
            const cid = getCidBySlug(fields.placeCategory, settings.subCategories) || settings.defaultPlacesCid; // TODO: add defaultPlacesCid to ACP
            const topicData = { title: fields.placeTitle, content: fields.placeDescription, tags: topicTags, cid, uid: req.uid };
            topic = await topics.post(topicData);
        }

        const { tid, timestamp, slug, user } = topic.topicData ? topic.topicData : topic;

        const uploadedImages = await imageUploader(req, tid);

        if (uploadedImages && uploadedImages.length > 0) {

            fields.gallery = uploadedImages.map(image => image.pic);
            const mainImageIndex = fields.mainImage ? Number(fields.mainImage) : 0;
            const mainImage = uploadedImages.find((image, index) => index === mainImageIndex);

            if (mainImage) {
                fields.placethumb = mainImage.thumb || mainImage.pic || '';
                fields.pic = mainImage.pic || '';
                await topics.thumbs.associate({ id: tid, path:fields.placethumb });
                winston.verbose(`Successfully associated thumbnail for topic id ${fields.placethumb}]`);
            } else {
                winston.verbose('Main image not found');
            }
        }

        
        fields.created = timestamp;
        fields.tid = tid;
        fields.uid = req.uid;
        fields.postslug = slug;

        if (user) {
            fields.author = user.displayname;
            fields.userslug = user.userslug;
        }

        await topics.setTopicFields(tid, { mapFields: fields });
        await db.setObjectField(DATABASE_KEYNAME+':places', tid, fields);


        helpers.formatApiResponse(200, res, { status: "success", tid, topic, notice, fields });
    } catch (error) {

            winston.error('Error in placeFormHandler: ', error);
            helpers.formatApiResponse(500, res, { 
                error: 'An unexpected error occurred. Please try again later.', 
                notice 
            });

        
    }
}



async function editTopic(tid, topicData, uid) {
    const topic = await topics.getTopicData(tid);
  
    if (!topic?.mainPid) {
        topic.editError = 'Topic not found tid '+tid
        winston.verbose(topic.editError);
        return topic
    }

    const canEdit = await privileges.posts.canEdit(topic.mainPid, uid);
    if (!canEdit) {

        topic.editError = uid+' are not allowed to edit this post tid '+tid
        winston.verbose(topic.editError);
    }else{
        await topics.setTopicFields(tid, topicData)
        await posts.edit({
            uid: uid,
            pid: topic.mainPid,
            content: topicData.content
        });
    }
    return topic;
}




function getCidBySlug(slug, categories) {
    const category = categories.find(category => category.slug === slug);
    if (category && category.cid) {
        return parseInt(category.cid, 10); 
    }
    return 0; 
}
