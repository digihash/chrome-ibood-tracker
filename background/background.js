(function () {
    "use strict";
    
    
    /**
     *  Check if a new product has been introduced
     */
    function doUpdateCheck() {
        ibood.getLatestProduct(function (data) {

            // Is there a new product?
            if (data.title !== ibood.lastProduct.title) {
                
                // Set the new data as current product
                ibood.lastProduct = data;

                // Display a message with the newest product
                sendNotification(data.title, data.price_new, data.image);
            }

        });
    }
    
    
    /**
     *  Send a notification to the user
     */
    function sendNotification(title, message, image) {
        
        // Create a callback to show the notification
        var showNotification = function (title, message, imageblob) {
        
            // Create the options object
            var options = {};
            options.type = imageblob === undefined ? 'basic' : 'image';
            options.title = title;
            options.message = message;
            options.iconUrl = "../images/icon-128.png";

            // Add an image if we use images
            if (options.type === 'image') {
                options.imageUrl = imageblob;
            }
            
            // Display the notification
            var notif = chrome.notifications.create(options);
        };
        
        // If there is an image, we should load it using xhr.
        if (image !== undefined) {
            
            var xhr = new XMLHttpRequest();
            xhr.open('GET', image, true);
            xhr.responseType = 'blob';
            xhr.onload = function (e) {
                var imageblob = window.URL.createObjectURL(this.response);
                
                showNotification(title, message, imageblob);
            };
            xhr.send();
            
        } else {
            showNotification(title, message);
        }
    }
    
    // Set an event listener for notifications
    chrome.notifications.onClicked.addListener(ibood.openInTab);
    
    // Scrape ibood for the first time
    doUpdateCheck();
    
    // Start the checking interval
    setInterval(doUpdateCheck, 1e4);
    
}());