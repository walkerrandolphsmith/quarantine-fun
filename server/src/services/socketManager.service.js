const WebSocket = require('ws');

exports.createSocketsManager = function(httpServer) {
    const wsServer = new WebSocket.Server({
        server: httpServer,
    });

    const listenersByMessageType = {};

    wsServer.on('connection', (connection) => {
        function broadcast(message) {
            wsServer.clients.forEach(client => {
                client.send(JSON.stringify(message))
            })
        }
        function sendToOthers(message) {
            wsServer.clients.forEach(client => {
                if (client != connection) {
                    client.send(JSON.stringify(message))
                }
            })
        }
        connection.on('message', message => {
            try {
                const payload = JSON.parse(message);
                const handler = listenersByMessageType[payload.type];
                handler(payload)
                    .then(reply => broadcast(reply))
                    .catch(error => broadcast({ type: 'error', reason: error.toString() }))
            }
            catch(e) {
    
            }
        });
    });

    return {
        on: function (messageType, messageHandler) {
            listenersByMessageType[messageType] = messageHandler;
        }
    }
}