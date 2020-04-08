const { words } = require('./words.service');
const { fisherYates } = require('./random.service');

exports.getCards = function getCards({ numberOfCards = 25, category = null }) {
  const cards = category !== null
    ? words.filter(word => word.categories.includes(category))
    : words.filter(word => word.categories.length === 0)
  return fisherYates(cards, numberOfCards)
}