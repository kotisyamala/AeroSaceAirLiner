var app = {
    // Application Constructor
    initialize: function() {
        console.log('App initialize called'); // <-- Add this
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', 'backbutton'.
    onDeviceReady: function() {
        console.log('deviceready fired'); // <-- Add this
        this.receivedEvent('deviceready');
        this.setupNotificationListeners();
        this.setupButtonListeners();
        this.requestNotificationPermissions(); // Request permissions on start
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        // Placeholder for visual feedback if needed
    },

    // --- Local Notification Setup ---
    requestNotificationPermissions: function() {
        if (cordova.plugins.notification.local) {
            cordova.plugins.notification.local.requestPermission(function (granted) {
                console.log('Notification permission granted: ' + granted);
                if (!granted) {
                    alert('Please enable notifications in your device settings for flight updates.');
                }
            });
        } else {
            console.warn('Local notification plugin not found.');
        }
    },

    setupNotificationListeners: function() {
        if (cordova.plugins.notification.local) {
            // Listen for notification click event
            cordova.plugins.notification.local.on('click', function (notification, tap) {
                console.log('Notification clicked: ', notification);
                // You could navigate to a specific page or show details here
                alert('Clicked on notification: ' + notification.text);
                // Example: If notification had a JSON payload
                // let data = JSON.parse(notification.data);
                // console.log('Notification data:', data);
            });

            // Listen for notification trigger event (when it appears)
            cordova.plugins.notification.local.on('trigger', function (notification, state) {
                console.log('Notification triggered: ', notification);
                 // Do something when the notification is triggered (optional)
            });

        } else {
             console.warn('Local notification plugin not found. Click events will not work.');
        }
    },

    scheduleLocalNotification: function(id, title, text, data = {}) {
         if (cordova.plugins.notification.local) {
            cordova.plugins.notification.local.schedule({
                id: id,
                title: title,
                text: text,
                foreground: true, // Keep notification in tray even if app is open (optional)
                vibrate: true,
                sound: true,
                attachments: [], // Optional: Add attachments
                data: data, // Optional: Attach custom data
                 // You can also schedule for a specific time: at: new Date(new Date().getTime() + 5*1000)
            });
            console.log('Scheduled local notification id:', id);
         } else {
             console.warn('Local notification plugin not found. Cannot schedule local notification.');
             // Simulate the log message appearing in history if plugin isn't available
             this.addNotificationToHistory(`(Local NOT available) ${title}: ${text}`);
         }
    },

    // --- In-App Notification Display ---
    displayInAppNotification: function(message, duration = 5000) { // duration in ms
        const notificationArea = document.getElementById('in-app-notification-area');
        const messageSpan = document.getElementById('in-app-notification-message');
        const closeButton = document.getElementById('in-app-close-button');

        // Clear any existing hide timer
        if (this.hideInAppTimer) {
            clearTimeout(this.hideInAppTimer);
        }

        messageSpan.textContent = message;
        notificationArea.classList.remove('hidden');

        // Auto hide after duration
        this.hideInAppTimer = setTimeout(() => {
            this.hideInAppNotification();
        }, duration);

        // Handle close button click
        closeButton.onclick = () => {
            this.hideInAppNotification();
        };

         // Add to history immediately
        this.addNotificationToHistory(message);
    },

    hideInAppNotification: function() {
        const notificationArea = document.getElementById('in-app-notification-area');
        notificationArea.classList.add('hidden');
        // Clear the timer in case it was hidden manually
        if (this.hideInAppTimer) {
            clearTimeout(this.hideInAppTimer);
            this.hideInAppTimer = null;
        }
    },

     addNotificationToHistory: function(message) {
        const historyList = document.getElementById('history-list');
        const listItem = document.createElement('li');
        const timestamp = new Date().toLocaleTimeString();
        listItem.textContent = `[${timestamp}] ${message}`;
        // Add to the top of the list
        historyList.prepend(listItem);
    },


    // --- Simulation Logic ---
    setupButtonListeners: function() {
        console.log('Setting up button listeners'); // <-- Add this
        document.getElementById('simulate-gate-change').addEventListener('click', () => {
        console.log('Simulate Gate Change button clicked'); // <-- Add this
            this.simulateGateChange();
        });
        document.getElementById('simulate-delay').addEventListener('click', () => {
            console.log('Simulate Delay button clicked'); // <-- Add this
            this.simulateDelay();
        });
         document.getElementById('simulate-boarding').addEventListener('click', () => {
            console.log('Simulate Boarding button clicked'); // <-- Add this
            this.simulateBoarding();
        });
    },

    simulateGateChange: function() {
        const newGate = 'A' + Math.floor(Math.random() * 10 + 1); // Random gate A1-A10
        const message = `Flight AB123: Gate changed to ${newGate}. Proceed to Gate ${newGate}.`;
        const notificationId = 1; // Unique ID for this type of notification

        // Update UI
        document.getElementById('gate-text').textContent = newGate;

        // Trigger Notifications
        this.displayInAppNotification(message);
        this.scheduleLocalNotification(notificationId, 'Flight AB123 Update', message, { type: 'gate_change', newGate: newGate });
    },

    simulateDelay: function() {
         const delayMinutes = Math.floor(Math.random() * 60 + 15); // Random delay 15-75 mins
         // Simple way to calculate new time - just add minutes (doesn't handle date changes)
         const currentDepartureText = document.getElementById('departure-text').textContent;
         const [hours, minutes] = currentDepartureText.split(':').map(Number);
         const currentDate = new Date();
         currentDate.setHours(hours, minutes, 0, 0);
         currentDate.setMinutes(currentDate.getMinutes() + delayMinutes);
         const newDepartureTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


         const message = `Flight AB123 is now delayed. New estimated departure time is ${newDepartureTime}.`;
         const notificationId = 2; // Unique ID for this type of notification

         // Update UI
         document.getElementById('status-text').textContent = 'Delayed';
         document.getElementById('status-text').setAttribute('data-status', 'delayed');
         document.getElementById('departure-text').textContent = newDepartureTime;

         // Trigger Notifications
         this.displayInAppNotification(message);
         this.scheduleLocalNotification(notificationId, 'Flight AB123 Update', message, { type: 'delay', newDeparture: newDepartureTime });
    },

    simulateBoarding: function() {
        const gate = document.getElementById('gate-text').textContent;
        const message = `Flight AB123 is now boarding at Gate ${gate || '--'}. Please proceed to the gate.`;
        const notificationId = 3; // Unique ID for this type of notification

        // Update UI
        document.getElementById('status-text').textContent = 'Boarding';
        document.getElementById('status-text').setAttribute('data-status', 'boarding');
        document.getElementById('boarding-text').textContent = 'Now'; // Or calculate a time window

        // Trigger Notifications
        this.displayInAppNotification(message);
        this.scheduleLocalNotification(notificationId, 'Flight AB123: Boarding', message, { type: 'boarding' });
    }
};

app.initialize();