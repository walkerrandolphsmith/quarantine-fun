
exports.getPlayerFromGameSession = function (req, gameId) {
    const sessionsByGameId = req.session.sessionsByGameId || {};
    const name = sessionsByGameId[gameId];
    return name;
}

exports.addPlayerToGameSession = function (req, gameId, name) {
    if (!req.session.sessionsByGameId) {
        req.session.sessionsByGameId = {
            [gameId]: name
        }
    } else {
        const session = req.session.sessionsByGameId[gameId];
        if (!session) {
            req.session.sessionsByGameId[gameId] = name;
        }
    }
}