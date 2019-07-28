self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    var data = {};
    if (event.data) {
        data = event.data.json();
    }

    var title = data.title;
    var message = data.message;

    event.waitUntil(self.registration.showNotification(title, {
        body: message,
        data: data
    }));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    var url = event.notification.data.url;
    if (!url) {
        return;
    }

    event.waitUntil(
        clients.matchAll({
            type: 'window'
        })
            .then(function (windowClients) {
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});