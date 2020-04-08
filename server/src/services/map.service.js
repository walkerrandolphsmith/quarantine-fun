const { fisherYates } = require('./random.service');

const RED = 0;
const BLUE = 1;
const NEUTRAL = -1;
const DEATH = 2;
const UNKNOWN = 3;

exports.generateMap = function generateMap(first = BLUE) {
    const size = 25;
    const second = first === RED ? BLUE : RED;
    const emptyMap = [...Array(size).keys()];
    const positions = fisherYates(emptyMap, 14);

    const map = emptyMap.map(_ => NEUTRAL);
    for(let i = 0; i <=6; i++) {
        map[positions[i]] = first;
    }
    for(let i = 7; i <= 12; i++) {
        map[positions[i]] = second;
    }
    map[positions[13]] = DEATH;
    return map;
};

exports.revealMap = function revealMap(game) {
    const { map, selections } = game;
    for(let i = 0; i < 25; i++) {
        if(!selections.includes(i)) {
            map[i] = UNKNOWN;
        }
    }
    return map;
}
