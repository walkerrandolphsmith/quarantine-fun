const { getCards } = require('./card.service');
const { generateMap, revealMap } = require('./map.service');
const { Teams, Roles, Phases } = require('../constants');
const Game = require('../models/Game');

exports.getCandidateGame = (category = null) => {
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

exports.persistsGame = (gameState) => {
    const game = { ...gameState, phase: Phases.FUTURE };
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
            if (game.phase > Phases.FUTURE) {
                throw new Error("Can't join an active game")
            }
            const bluePlayers = game.players.reduce((sum, elm) => sum += elm.team === Teams.BLUE ? 1 : 0, 0)
            const redPlayers = game.players.reduce((sum, elm) => sum += elm.team === Teams.RED ? 1 : 0, 0)
            const teamAssignment = bluePlayers > redPlayers ? Teams.RED : Teams.BLUE;
            const player = {
                name,
                role: Roles.SPY,
                team: teamAssignment
            }
            return Game.findByIdAndUpdate(gameId, { $push: { players: player } });
        })
}

exports.startGame = (gameId) => {
    return Game.findById(gameId)
        .then(game => {
            if (game.phase >= Phases.ACTIVE) {
                throw new Error("Can't start a started game")
            }
            if (game.players.length < 2) {
                throw new Error("Requires at least three players");
            }
            const spymasters = game.players.filter(player => player.role === Roles.SPYMASTER);

            if (spymasters.length !== 2) {
                throw new Error("There must be two spymasters");
            }
            if (spymasters[0].team === spymasters[1].team) {
                throw new Error("Spymasters must be on separate teams");
            }
            return Game.findByIdAndUpdate(gameId, { phase: Phases.ACTIVE });
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

exports.handleCardSelection = (gameId, selection) => {
    return Game
    .findByIdAndUpdate(gameId, { $push: { selections: selection } })
    .then(() => {
        return Game.findById(gameId)
        .then(game => {
            const redCardIndexes = game.map.map((card, index) => card === Teams.RED ? index : null).filter(index => index !== null);
            const blueCardIndexes = game.map.map((card, index) => card === Teams.BLUE ? index : null).filter(index => index !== null);
            const redWins = redCardIndexes.every(index => game.selections.includes(index));
            const blueWins = blueCardIndexes.every(index => game.selections.includes(index));

            const winner = (() => {
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
                    const reply = { type: 'revealcard', index: selection, value: game.map[selection], winner }
                    return reply;
                })
        })
    })
}