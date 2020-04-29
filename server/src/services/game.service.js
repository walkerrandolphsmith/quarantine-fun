const mongoose = require('mongoose');
const { getCards } = require('./card.service');
const { generateMap, revealMap } = require('./map.service');
const { Teams, Roles, Phases, CardTypes } = require('../constants');
const Game = require('../models/Game');

const getCandidateGame = (category = null) => {
    return {
        cards: getCards({ category }),
        map: generateMap(Math.round(Math.random()))
    };
}

exports.replaceCard = (category = null) => {
    const cards = getCards({ numberOfCards: 1, category });
    const replacement = cards[0];
    return replacement;
}

const persistsGame = (gameState) => {
    const redCards = gameState.map.filter(card => card === Teams.RED);
    const blueCards = gameState.map.filter(card => card === Teams.BLUE);

    const firstTeam = redCards.length > blueCards.length ? Teams.RED : Teams.BLUE;

    const game = { ...gameState, phase: Phases.FUTURE, firstTeam };
    const candidate = new Game(game);
    return candidate.save().then(game => ({ ...game, id: game._id }));
}

exports.getGame = (gameId, playerId) => {
    return Game.findById(gameId)
    .then(game => {
        game.map = revealMap(game, playerId);
        game.id = game._id;
        return game;
    })
}

exports.addPlayer = (gameId, name) => {
    return Game.findById(gameId)
        .then(game => {
            if (game === null) {
                throw new Error(3)
            }
            if (game.phase > Phases.FUTURE) {
                throw new Error(2)
            }
            if (game.players.find(player => player.name === name)) {
                throw new Error(0)
            }
            const spymasters = game.players.filter(player => player.role === Roles.SPYMASTER);
            const role = spymasters.length >= 2 ? Roles.SPY : Roles.SPYMASTER;
            const bluePlayers = game.players.reduce((sum, elm) => sum += elm.team === Teams.BLUE ? 1 : 0, 0)
            const redPlayers = game.players.reduce((sum, elm) => sum += elm.team === Teams.RED ? 1 : 0, 0)
            const team = bluePlayers > redPlayers ? Teams.RED : Teams.BLUE;
            const player = {
                name,
                role,
                team,
            }
            return Game.findByIdAndUpdate(gameId, { $push: { players: player } });
        })
        .catch(error => {
            if (error instanceof mongoose.Error) {
                throw new Error(1)
            }
            throw error;
        })
}

exports.startGame = (gameId) => {
    return Game.findById(gameId)
        .then(game => {
            if (game === null) {
                throw new Error(3)
            }
            if (game.phase >= Phases.ACTIVE) {
                throw new Error(2)
            }
            if (game.players.length < 2) {
                throw new Error(4);
            }
            return Game.findByIdAndUpdate(gameId, { phase: Phases.ACTIVE });
        })
        .catch(error => {
            if (error instanceof mongoose.Error) {
                throw new Error(7)
            }
            throw error;
        })
}

exports.addSelection = (gameId, selection) => {
    return Game.findByIdAndUpdate(gameId, { $push: { selections: selection } })
}

exports.cyclePlayer = (gameId, name) => {
    return Game.findById(gameId)
        .then(game => {
            const player = game.players.find(player => player.name === name);
            const { role, team } = player;
            const oppositeTeam = team === Teams.BLUE ? Teams.RED : Teams.BLUE;
            if (role === Roles.SPYMASTER) {
                return Game.updateOne(
                    { _id: gameId, "players.name": name },
                    { "$set": { "players.$.team": oppositeTeam, "players.$.role": Roles.SPY } }
                )
            } else {
                const teamAlreadyHasSpyMaster = game.players
                    .filter(p => p.name !== name && p.team === team)
                    .some(p => p.role === Roles.SPYMASTER);

                if (teamAlreadyHasSpyMaster) {
                    return Game.updateOne(
                        { _id: gameId, "players.name": name },
                        { "$set": { "players.$.team": oppositeTeam } }
                    )
                } else {
                    return Game.updateOne(
                        { _id: gameId, "players.name": name },
                        { "$set": { "players.$.role": Roles.SPYMASTER } }
                    )
                }
            }
        })
        .then(udpates => {
            return Game.findById(gameId);
        })
}

exports.branch = gameId => {
    return Game.findById(gameId)
        .then(game => {
            const { cards, map } = getCandidateGame();
            const players = game.players.map(player => ({
                name: player.name,
                role: player.role,
                team: player.team,
            }))

            const newGame = {
                cards,
                map,
                players
            }
            return persistsGame(newGame)
        })
}

exports.handleCardSelection = (gameId, selection, playerName) => {
    return Game
    .findByIdAndUpdate(gameId, { $push: { selections: selection } })
    .then(() => {
        return Game.findById(gameId)
        .then(game => {
            const deathCardIndex = game.map.indexOf(CardTypes.DEATH);
            const isDeathCard = deathCardIndex === selection;
            const redCardIndexes = game.map.map((card, index) => card === Teams.RED ? index : null).filter(index => index !== null);
            const blueCardIndexes = game.map.map((card, index) => card === Teams.BLUE ? index : null).filter(index => index !== null);
            const redWins = redCardIndexes.every(index => game.selections.includes(index));
            const blueWins = blueCardIndexes.every(index => game.selections.includes(index));

            const winner = (() => {
                if (isDeathCard) {
                    const currentPlayer = game.players.find(player => player.name === playerName);
                    return currentPlayer.team === Teams.RED ? Teams.BLUE : Teams.RED;
                }
                if (redWins) return Teams.RED;
                if (blueWins) return Teams.BLUE;
                return -1
            })();

            return Game
                .findByIdAndUpdate(
                    gameId,
                    {
                        winner,
                        phase: winner !== -1 ? Phases.DONE : Phases.ACTIVE
                    }
                )
                .then(_ => {
                    if (winner >= 0) {
                        return { type: 'gameover', index: selection, value: game.map[selection], winner, map: game.map }
                    }
                    return { type: 'revealcard', index: selection, value: game.map[selection], winner }
                })
        })
    })
}

exports.getCandidateGame = getCandidateGame;
exports.persistsGame = persistsGame;