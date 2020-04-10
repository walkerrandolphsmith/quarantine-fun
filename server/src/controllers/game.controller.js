const gameService = require('../services/game.service');
const { log } = require('../services/log.service');
const { Phases } = require('../constants');

function getPlayerName (req) {
    const gameId = req.params.id;
    const sessionsByGameId = req.session.sessionsByGameId || {};
    const name = sessionsByGameId[gameId];
    return name;
}

exports.handleStaticRoute = (route, entryPoint) => (req, res) => {
    const gameId = req.params.id;
    if (!gameId) {
        log(`LACKS GAMEID`);
        res.redirect(301, '/');
    }
    return gameService.getGame(gameId)
        .then(game => {
            if (game === null){
                log(`NOT FOUND: ${gameId}`);
                res.redirect(301, '/')
            }
            if (route === 'lobby' && game.phase >= Phases.ACTIVE) {
                log(`LOBBY OF ACTIVE GAME: ${gameId}`);
                res.redirect(301, `/game/${gameId}`)
            }
            if (route === 'game' && game.phase <= Phases.FUTURE) {
                log(`PLAY INACTIVE GAME: ${gameId}`);
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

exports.persistsGame = (req, res, next) => {
    const isQuickStart = Object.keys(req.body).length < 1;
    const gameState = isQuickStart
        ? gameService.getCandidateGame()
        : req.body;
    return gameService.persistsGame({ ...gameState, winner: -1 })
        .then(game => res.send(game))
}

exports.getGame = (req, res, next) => {
    const gameId = req.params.id;
    const playerName = getPlayerName(req);
    return gameService.getGame(gameId, playerName)
        .then(game => res.send(game))
}

exports.addPlayer = async (req, res, next) => {
    const { gameId, name } = req.body;

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

    await gameService.addPlayer(gameId, name)
        .then(_ => res.send({}))
}

exports.startGame = async (req, res, next) => {
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
        .then(game => ({ type: 'branch', gameId: game.id }))
}
