process.env.NODE_ENV !== 'production' && require('dotenv').config();

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const express = require('express');
const http = require('http');
const path = require('path');
const gameController = require('./controllers/game.controller');
const { createSocketsManager } = require('./services/socketManager.service');
const { configureDatabase } = require('./services/databaseManager.service');
const { log } = require('./services/log.service');
const { port } = require('./environment');


configureDatabase();
const app = express();


const assetsPath = path.resolve(__dirname, '..', '..', 'client', 'build');
const entrypoint = path.resolve(assetsPath, 'index.html');
app.use('/', express.static(assetsPath))
app.get('/architect', (_, res) => res.sendFile(entrypoint))
app.get('/lobby/:id', gameController.handleStaticRoute('lobby', entrypoint))
app.get('/game/:id', gameController.handleStaticRoute('game', entrypoint))

app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ['key']
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/api/getCandidateGame/:category', gameController.getCandidateGame);
app.get('/api/getCandidateGame', gameController.getCandidateGame);
app.get('/api/replaceCard', gameController.replaceCard);
app.get('/api/replaceCard/:category', gameController.replaceCard);
app.post('/api/createGame', wrapAsync(gameController.persistsGame));
app.post('/api/addPlayer', wrapAsync(gameController.addPlayer))
app.post('/api/startGame', wrapAsync(gameController.startGame))
app.get('/api/game/:id', wrapAsync(gameController.getGame));


app.use(function (error, req, res, next) {
  return res.status(500).json({ code: error.message })
});

function wrapAsync(routeHandler) {
  return (req, res, next) => {
    routeHandler(req, res, next).catch(next);
  }
}


const server = http.createServer(app);
const socketManager = createSocketsManager(server);
socketManager.on('cardselection', gameController.handleCardSelection)
socketManager.on('playeradded', gameController.handlerPlayerAdded)
socketManager.on('gamestarted', gameController.handleGameStarted)
socketManager.on('cycleplayer', gameController.handleCyclePlayer)

server.listen(port, _ => log(`Listening on port ${port}`));