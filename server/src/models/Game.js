const mongoose = require('mongoose');

var cardScheme = new mongoose.Schema({
    id: String,
    text: String,
    image: String,
});

var playerScheme = new mongoose.Schema({
    id: String,
    name: String,
    role: String,
    team: Number
})
  
var scheme = new mongoose.Schema({
    cards: [cardScheme],
    id: String,
    map: [Number],
    selections: [Number],
    players: [playerScheme],
    phase: Number,
    winner: Number
});
  
module.exports = mongoose.model("Game", scheme);