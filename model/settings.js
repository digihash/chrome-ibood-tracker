/* global chrome */

(function () {

    "use strict";

    window.settings = {

        // Default settings when no other settings are found
        defaultSettings: {
            "checkInterval": 3e5,
            "checkIntervalHunt": 8e3,
            "country": "be",
            "displayStock": false,
            "enableNotifications": true,
            "productAlertDirectOrder": false,
            "productAlertKeywords": []
        },

        // Local copy of the settings
        settings: {},

        // The storagekey for google api
        storageKey: 'settings',

        // Get a setting by it's name
        get: function (key, callback) {

            var getKey = function (settings_obj) {

                // Set the default value
                var value = null;

                // Does the key exist?
                if (settings_obj.hasOwnProperty(key)) {
                    value = settings_obj[key];
                } else if (window.settings.defaultSettings.hasOwnProperty(key)) {
                    // If the value is null, check if it exists in the defaultSettings
                    value = window.settings.defaultSettings[key];
                }

                // If there is a valid callback, use it.
                if (typeof callback === "function") {
                    callback(value);
                }

            };

            if (window.settings.settings.country === undefined) {
                window.settings.loadSettings(getKey);
            } else {
                getKey(window.settings.settings);
            }

        },


        /**
         *  Load the entire setting object from chrome storage
         */
        loadSettings: function (callback) {

            // Get the settings from the chrome api
            chrome.storage.sync.get(function (data) {

                // Get the correct key
                if (data.hasOwnProperty(window.settings.storageKey)) {
                  data = data[window.settings.storageKey];
                }

                // Is this the first time it's loaded? Add the default data.
                var newdata = false;
                for (var key in window.settings.defaultSettings) {
                  if (!data.hasOwnProperty(key)) {
                    data[key] = window.settings.defaultSettings[key];
                    newdata = true;
                  }
                }

                // If data has changed, save the new object
                if (newdata) {
                    // Store the new data object
                    window.settings.storeSettings(data);
                }

                // Store a copy so we don't need to query the api all the time
                window.settings.settings = data;

                // If there is a valid callback function, use it
                if (typeof callback === "function") {
                    callback(data);
                }

            });

        },


        /**
         *  Change the value of a setting
         */
        set: function (key, value) {

            var setKey = function (settings_obj) {

                // Change the value for this key
                settings_obj[key] = value;

                // Store the new settings object
                window.settings.storeSettings(settings_obj);

            };

            // Are the settings loaded?
            if (window.settings.settings.country === undefined) {
                window.settings.loadSettings(setKey);
            } else {
                setKey(window.settings.settings);
            }

        },


        /**
         *  Store and sync settings with chrome api
         */
        storeSettings: function (data) {

            // Create an items object
            var items = {};
            items[window.settings.storageKey] = data;

            // Send the data to the storage
            chrome.storage.sync.set(items);

        }



    };

    // How do we communicate the settings object?
    if (typeof window === 'undefined' || window.mocha === true) {
        module.exports = window.settings;
    }

} ());
