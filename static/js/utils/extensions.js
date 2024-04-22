"use strict";
define("utils/extensions", [
  "core/variables" /*   Global object UniMap  */,
], function (UniMap) {
  UniMap.console = {
    log: (...args) => {
      if (app.user.isAdmin) {
        console.log(...args);
      }
    },
  };

  return UniMap;
});
