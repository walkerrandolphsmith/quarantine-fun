const gameService = require('../services/game.service');

exports.getCandidateGame = (req, res) => {
    res.send(gameService.getCandidateGame());
}

exports.replaceCard = (req, res) => {
    res.send(gameService.replaceCard())
}

exports.persistsGame = (req, res) => {
    gameService.persistsGame(req.body)
        .then(game => res.send(game))
        .catch(error => res.error(error));
}

exports.getGame = (req, res) => {
    const gameId = req.params.id;
    gameService.getGame(gameId)
        .then(game => res.send(game))
        .catch(error => res.error(error))
}

exports.playGame = (req, res) => {
    const gameId = req.params.id;
    gameService.playGame(gameId)
        .then(game => res.send(game))
        .catch(error => res.error(error))
}

exports.handleCardSelection = (payload) => {
    const { gameId, index } = payload;
    return gameService.addSelection(gameId, index)
    .then(() => {
        return gameService.getGame(gameId)
        .then(game => {
            const reply = { type: 'revealcard', index, value: game.map[index] }
            return reply;
        })
    })
    .catch(_ => {})
}