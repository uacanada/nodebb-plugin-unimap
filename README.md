## 🍁 Map Your *Own* Business with `nodebb-plugin-unimap`
Turn your NodeBB forum into a powerful app with an interactive map using `nodebb-plugin-unimap` plugin. Allow your users to add locations to the map and discover various monetization opportunities for your platform.

Demo available at [UACANADA.ORG](https://uacanada.org).


## 🚀 Installation

1. 🔍 **Prerequisites**:
   Ensure that NodeBB is properly installed and configured.
2. 📂 **Navigate to your NodeBB root directory**:
   `cd /path/to/your/nodebb`
3. 📦 **Install the main or dev version of the plugin**:

   ```
   npm i nodebb-plugin-unimap
   ```
    *Or*
   ```
   npm install https://github.com/uacanada/nodebb-plugin-unimap#main
   ```

    🛠️ *For those seeking cutting-edge features*: Install our development version (may be unstable):
     
     ```
     npm install https://github.com/uacanada/nodebb-plugin-unimap#dev
     ```
     
      NodeBB needs to be built with the new plugin

      ```
      ./nodebb stop 
      ./nodebb build 
      ./nodebb start 
      ./nodebb log
      ```
4. 🚀 **Activation**: After installing the plugin for the first time, navigate to the `/admin/extend/plugins#installed` panel and **activate** the `nodebb-plugin-unimap`. After activating the plugin, it is essential to **Rebuild & Restart** your NodeBB to ensure that all changes take effect.
5. 🖥️ **Access the Unimap Control Panel**: `/admin/plugins/unimap`
 - 🔧 **Configure the plugin**: You're provided with the flexibility to create tabs, categories, and various denominations suited to your unique context.
 - 💡 **Leverage its adaptability**: This plugin can be tailored for various needs - be it an event map, a real estate platform, or even a social network.
 - ⚙️ **Configuration Changes**: Once you've adjusted and saved the settings, perform another rebuild and restart. This ensures certain settings are transpiled into the core min.js file, allowing the plugin to operate swiftly and gain immediate access to the required environment without any extra requests.



## 🤝 Connect & Support

**Feedback**: We are in active development and greatly appreciate any feedback or suggestions. Please don't hesitate to share your thoughts!
- 💌 For personal inquiries, join us on [Discord](https://discord.gg/pKnXqz3vaq).
- 🐛 If you encounter issues or have questions related to this plugin's code, please [open a new issue](https://github.com/uacanada/nodebb-plugin-unimap/issues/new).