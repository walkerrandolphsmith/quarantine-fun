const Roles = {
    SPY: "spy",
    SPYMASTER: "spymaster"
}

const Teams = {
    BLUE: 0,
    RED: 1,
}

const CardTypes = {
    RED: Teams.RED,
    BLUE: Teams.BLUE,
    NEUTRAL: -1,
    DEATH: 2,
    UNKNOWN: 3,
}

const Phases = {
    FUTURE: 0,
    ACTIVE: 10,
    DONE: 100
}

exports.Roles = Roles;
exports.Teams = Teams;
exports.CardTypes = CardTypes;
exports.Phases = Phases;