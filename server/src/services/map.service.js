const { fisherYates } = require('./random.service');
const { CardTypes, Roles } = require('../constants');

exports.generateMap = function generateMap(first = CardTypes.BlUE) {
    const size = 25;
    const second = first === CardTypes.RED ? CardTypes.BLUE : CardTypes.RED;
    const emptyMap = [...Array(size).keys()];
    const firstDeckSize = 7;
    const secondDeckSize = firstDeckSize - 1;
    const spyDeckSize = firstDeckSize + secondDeckSize;
    const nonNeutralDeckSize = spyDeckSize + 1;

    const positions = fisherYates(emptyMap, nonNeutralDeckSize);

    const map = emptyMap.map(_ => CardTypes.NEUTRAL);
    for(let i = 0; i < firstDeckSize; i++) {
        map[positions[i]] = first;
    }
    for(let i = firstDeckSize; i < spyDeckSize; i++) {
        map[positions[i]] = second;
    }
    map[positions[spyDeckSize]] = CardTypes.DEATH;
    return map;
};

exports.revealMap = function revealMap(game, playerId) {
    const { map, selections, players } = game;
    const player = players.find(player => player.name === playerId);

    const isSpyMaster = player && player.role === Roles.SPYMASTER;

    if (isSpyMaster) return map;

    for(let i = 0; i < 25; i++) {
        if(!selections.includes(i)) {
            map[i] = CardTypes.UNKNOWN;
        }
    }
    return map;
}
