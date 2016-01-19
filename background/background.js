/* global chrome */

(function () {

    "use strict";

    /**
     *  Check if a new product has been introduced
     */
    function doUpdateCheck() {
        window.ibood.getLatestProduct(function (data) {

            // Is there a new product?
            if (data.title !== window.ibood.lastProduct.title) {

                // Set the new data as current product
                window.ibood.lastProduct = data;

                // If the title contains one of the productAlertKeywords, open the product page!
                window.settings.get("productAlertKeywords", function (keywords) {

                    // Does one of the keywords match the given product?
                    if (keywords.length > 0 && !!data.title.match(new RegExp(keywords.join("|"), "i"))) {

                        // FOUND! What page do we open?!
                        chrome.extension.getBackgroundPage().settings.get('productAlertDirectOrder', function (data) {

                            if (data) {

                                // Try loading the order page directly
                                window.ibood.openOrderPage();

                            } else {

                                // Simply open the product page
                                window.ibood.openInTab();

                            }

                        });


                    }

                });

                // If there is a hunt ongoing, set the browserAction badge
                window.ibood.isHunt(function (isHunt) {

                    if (isHunt) {
                        chrome.browserAction.setBadgeText({ "text": "Hunt!" });
                        chrome.browserAction.setBadgeBackgroundColor({ "color": "#F57F27" });
                    } else {
                        // Make sure we remove the badge when the hunt is over
                        chrome.browserAction.setBadgeText({ "text": "" });
                    }

                });

                // Display a message with the newest product
                sendNotification(data.title, data.price_new, data.image);
            }

        });
    }


    /**
     *  Send a notification to the user
     */
    function sendNotification(title, message, image) {

        // If the computer is locked, we don't send any notifications
        if (window.computer && window.computer.isLocked) {
            return false;
        }

        // Create a callback to show the notification
        var showNotification = function (title, message, imageblob) {

            // Create the options object
            var options = {};
            options.type = imageblob === undefined ? 'basic' : 'image';
            options.title = String(title);
            options.message = String(message);
            options.iconUrl = "../images/icon-128.png";

            // Add an image if we use images
            if (options.type === 'image') {
                options.imageUrl = imageblob;
            }

            // Display the notification
            chrome.notifications.create(options);
        };

        // If there is an image, we should load it using xhr.
        if (image !== undefined) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', image, true);
            xhr.responseType = 'blob';
            xhr.onload = function () {
                var imageblob = window.URL.createObjectURL(this.response);

                showNotification(title, message, imageblob);
            };
            xhr.send();

        } else {
            showNotification(title, message);
        }
    }


    // Set an event listener for notifications
    chrome.notifications.onClicked.addListener(window.ibood.openInTab);

    // Scrape ibood for the first time
    doUpdateCheck();

    // Check ibood to find out if a hunt is going on.
    window.ibood.isHunt(function (isHunt) {

        // Get the correct time interval
        window.settings.get('checkInterval' + (isHunt ? 'Hunt' : ''), function (interval) {

            // Start the update checker on the correct interval
            setInterval(doUpdateCheck, interval);

        });

    });


} ());
