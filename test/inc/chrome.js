/**
 *  Emulating the Chrome object for mocha testing
 */


module.exports = {

    extension: {

        getBackgroundPage: function () {

            return {

                ibood: require('../../model/ibood.js'),

                settings: require('../../model/settings.js')

            };

        }

    },

    storage: {

        sync: {

            get: function (callback) {

                if (typeof callback === 'function') {
                    callback({});
                }

            },


            set: function (items) {

                return items;

            }

        }

    }

};