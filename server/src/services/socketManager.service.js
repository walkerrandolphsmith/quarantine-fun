const WebSocket = require('ws');
const { getPlayerFromGameSession } = require('./session.service');

exports.createSocketsManager = function(httpServer, sessionParser) {
    const wsServer = new WebSocket.Server({
        server: httpServer,
    });

    const listenersByMessageType = {};

    wsServer.on('connection', (connection, req) => {
        connection.upgradeReq = req;

        sessionParser(connection.upgradeReq, {}, function(){});

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
                const player = getPlayerFromGameSession(req, payload.gameId);
                handler(payload, player)
                    .then(reply => broadcast(reply))
                    .catch(error => broadcast({ type: 'error', reason: error.toString() }))
            }
            catch(e) {
                broadcast({ type: 'error', reason: e.toString() });
            }
        });
    });

    return {
        on: function (messageType, messageHandler) {
            listenersByMessageType[messageType] = messageHandler;
        }
    }
}