var publicKey = $('#publicKey').data('value');
var vm = {};

$('#send').prop('disabled', true);
$('#title').prop('disabled', true);
$('#message').prop('disabled', true);
$('#url').prop('disabled', true);

$('#register').click(function () {
    registerForPushNotifications();
});

$('#send').click(function () {
    sendPushNotification();
});

function sendPushNotification() {

    var title = $('#title').val();
    var message = $('#message').val();
    var url = $('#url').val();

    if (!title || !message) {
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/api/values',
        data: {
            Title: title,
            Message: message,
            Url: url,
            PushEndpoint: vm.pushEndpoint,
            PushP256DH: vm.pushP256DH,
            PushAuth: vm.pushAuth
        },
        success: function (response) {

        }
    });
}

function registerForPushNotifications() {
    Notification.requestPermission().then(function (status) {
        if (status === 'denied') {
            vm.permissionDenied = true;
        } else if (status === 'granted') {
            initializeServiceWorker();
        }
    });

    subscribe();

    function initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register("service-worker.js").then(handleSWRegistration);
        }

        function handleSWRegistration(reg) {
            initialiseState(reg);
        }

        // Once the service worker is registered set the initial state
        function initialiseState(reg) {
            // Are Notifications supported in the service worker?
            if (!(reg.showNotification)) {
                return;
            }

            // Check if push messaging is supported
            if (!('PushManager' in window)) {
                return;
            }

            // We need the service worker registration to check for a subscription
            navigator.serviceWorker.ready.then(function (reg) {
                // Do we already have a push message subscription?
                reg.pushManager.getSubscription()
                    .then(function (subscription) {
                        vm.isSubscribed = subscription;
                    });
            });
        }
    }

    function subscribe() {
        navigator.serviceWorker.ready.then(function (reg) {
            var subscribeParams = { userVisibleOnly: true };

            //Setting the public key of our VAPID key pair.
            var applicationServerKey = urlB64ToUint8Array(publicKey);
            subscribeParams.applicationServerKey = applicationServerKey;

            reg.pushManager.subscribe(subscribeParams)
                .then(function (subscription) {
                    vm.isSubscribed = true;

                    var p256dh = base64Encode(subscription.getKey('p256dh'));
                    var auth = base64Encode(subscription.getKey('auth'));

                    vm.pushEndpoint = subscription.endpoint;
                    vm.pushP256DH = p256dh;
                    vm.pushAuth = auth;

                    $('#send').prop('disabled', false);
                    $('#title').prop('disabled', false);
                    $('#message').prop('disabled', false);
                    $('#url').prop('disabled', false);
                });
        });

        function urlB64ToUint8Array(base64String) {
            var padding = '='.repeat((4 - base64String.length % 4) % 4);
            var base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            var rawData = window.atob(base64);
            var outputArray = new Uint8Array(rawData.length);

            for (var i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        function base64Encode(arrayBuffer) {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
        }
    }
}