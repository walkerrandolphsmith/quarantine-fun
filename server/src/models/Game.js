const mongoose = require('mongoose');

var cardScheme = new mongoose.Schema({
    id: String,
    text: String,
    image: String,
});
  
var scheme = new mongoose.Schema({
    cards: [cardScheme],
    id: String,
    map: [Number],
    selections: [Number],
    currentTeam: Number
});
  
module.exports = mongoose.model("Game", scheme);