const gameService = require('../services/game.service');
const { log } = require('../services/log.service');
const { Phases } = require('../constants');

exports.handleStaticRoute = (route, entryPoint) => (req, res) => {
    const gameId = req.params.id;
    if (!gameId) {
        log(`LACKS GAMEID`);
        res.redirect(301, '/');
    }
    return gameService.getGame(gameId)
        .then(game => {
            if (game === null){
                log(`GAME NOT FOUND: ${gameId}`);
                res.redirect(301, '/')
            }
            if (route !== 'game' && game.phase >= Phases.ACTIVE) {
                log(`ATTEMPTING TO JOIN AN ACTIVE GAME: ${gameId}`);
                res.redirect(301, `/game/${gameId}`)
            }
            if (route === 'game' && game.phase <= Phases.FUTURE) {
                log(`CANNOT PLAY AN INACTIVE GAME: ${gameId}`);
                res.redirect(301, `/lobby/${gameId}`)
            }
            res.sendFile(entryPoint);
        })
        .catch(error => {
            log(`UNKNOWN: ${gameId}`, error);
            res.redirect(301, '/')
        })
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
    return gameService.persistsGame({ ...gameState, winner: -1 })
        .then(game => res.send(game))
}

function getPlayerFromGameSession (req, gameId) {
    const sessionsByGameId = req.session.sessionsByGameId || {};
    const name = sessionsByGameId[gameId];
    return name;
}

function addPlayerToGameSession(req, gameId, name) {
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

exports.getGame = (req, res) => {
    const gameId = req.params.id;
    const name = getPlayerFromGameSession(req, gameId);
    return gameService.getGame(gameId, name)
        .then(game => res.send(game))
}

exports.joinGame = (req, res) => {
    const { previousGameId, nextGameId } = req.body;
    const name = getPlayerFromGameSession(req, previousGameId);

    addPlayerToGameSession(req, nextGameId, name);
    res.send({});
}

exports.addPlayer = async (req, res) => {
    const { gameId, name } = req.body;

    addPlayerToGameSession(req, gameId, name);

    await gameService.addPlayer(gameId, name)
        .then(_ => res.send({}))
}

exports.startGame = async (req, res) => {
    const { gameId } = req.body;
    await gameService.startGame(gameId)
        .then(_ => res.send({}))
}

exports.handleCardSelection = (payload) => {
    const { gameId, index } = payload;
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

exports.handleBranch = (payload) => {
    const { gameId } = payload;
    return gameService.branch(gameId)
        .then(game => ({
            type: 'branch',
            previousGameId: gameId,
            nextGameId: game.id
        }))
}
