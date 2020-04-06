const { getCards } = require('./card.service');
const { generateMap, revealMap } = require('./map.service');
const Game = require('../models/Game');

exports.getCandidateGame = () => {
    return {
        cards: getCards(),
        map: generateMap()
    };
}

exports.replaceCard = () => {
    const cards = getCards(1);
    const replacement = cards[0];
    return replacement;
}

exports.persistsGame = (gameState) => {
    const candidate = new Game(gameState);
    return candidate.save();
}

exports.getGame = (gameId) => {
    return Game.findById(gameId);
}

exports.playGame = (gameId) => {
    return Game.findById(gameId)
    .then(game => {
        game.map = revealMap(game);
        return game;
    })
}

exports.addSelection = (gameId, selection) => {
    return Game.findByIdAndUpdate(gameId, { $push: { selections: selection } })
}