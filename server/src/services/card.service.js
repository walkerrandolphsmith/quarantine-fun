const { words } = require('./words.service');
const { fisherYates } = require('./random.service');

exports.getCards = function getCards(numberOfCards = 25) {
  return fisherYates(words, numberOfCards)
}