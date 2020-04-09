const gameService = require('../services/game.service');
const logService = require('../services/log.service');

function getPlayerId (req) {
    const gameId = req.params.id;
    const sessionsByGameId = req.session.sessionsByGameId || {};
    return sessionsByGameId[gameId];
}

function handleError (res) {
    return error => {
        logService.error(error)
        res.status(400).send(error)
    }
}

exports.getCandidateGame = (req, res) => {
    const category = req.params.category;
    res.send(gameService.getCandidateGame(category));
}

exports.replaceCard = (req, res) => {
    const category = req.params.category;
    res.send(gameService.replaceCard(category))
}

exports.persistsGame = (req, res) => {
    const isQuickStart = Object.keys(req.body).length < 1;
    const gameState = isQuickStart
        ? gameService.getCandidateGame()
        : req.body;
    gameService.persistsGame({ ...gameState, winner: -1 })
        .then(game => res.send(game))
        .catch(handleError(res))
}

exports.getGame = (req, res) => {
    const gameId = req.params.id;
    const playerId = getPlayerId(req);
    return gameService.getGame(gameId, playerId)
        .then(game => res.send(game))
        .catch(handleError(res))
}

exports.addPlayer = (req, res) => {
    const { gameId, name } = req.body;

    if (!req.session.sessionsByGameId) {
        req.session.sessionsByGameId = {
            [gameId]: name
        }
    } else {
        const session = req.session.sessionsByGameId[gameId];
        if (!session) {
            req.session.sessionsByGameId[gameId] = name;
        } else {
            handleError(res)(new Error("You are already playing a game"))
        }
    }

    return gameService.addPlayer(gameId, name)
        .then(_ => res.send({}))
        .catch(handleError(res))
}

exports.startGame = (req, res) => {
    const { gameId } = req.body;
    return gameService.startGame(gameId)
        .then(_ => res.send({}))
        .catch(handleError(res))
}

exports.handleCardSelection = (payload) => {
    const { gameId, index } = payload;
    const playerId = null;
    return gameService.handleCardSelection(gameId, index)
}

exports.handlerPlayerAdded = (payload) => {
    const { gameId } = payload;
    return gameService.getGame(gameId)
        .then(game => ({ type: 'playeradded', players: game.players }))
}
exports.handleCyclePlayer = (payload) => {
    const { gameId, name } = payload;
    return gameService.cyclePlayer(gameId, name)
        .then(game => ({ type: 'playeradded', players: game.players }))
}

exports.handleGameStarted = (payload) => {
    return Promise.resolve({ type: 'gamestarted', gameId: payload.gameId })
}
