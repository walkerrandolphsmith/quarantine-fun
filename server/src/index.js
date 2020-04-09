process.env.NODE_ENV !== 'production' && require('dotenv').config();

const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const express = require('express');
const http = require('http');
const gameController = require('./controllers/game.controller');
const { createSocketsManager } = require('./services/socketManager.service');
const { configureDatabase } = require('./services/databaseManager.service');
const { configureStaticResources } = require('./services/staticResource.service');
const { log, error } = require('./services/log.service');
const { port } = require('./environment');


configureDatabase();
const app = express();
configureStaticResources(app);

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
app.post('/api/createGame', gameController.persistsGame);
app.post('/api/addPlayer', gameController.addPlayer)
app.post('/api/startGame', gameController.startGame)
app.get('/api/game/:id', gameController.getGame);


const server = http.createServer(app);
const socketManager = createSocketsManager(server);
socketManager.on('cardselection', gameController.handleCardSelection)
socketManager.on('playeradded', gameController.handlerPlayerAdded)
socketManager.on('gamestarted', gameController.handleGameStarted)
socketManager.on('cycleplayer', gameController.handleCyclePlayer)

process.on('unhandledRejection', function(reason, p){
    error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('uncaughtException', (err, origin) => {
    error(
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
    );
});

server.listen(port, _ => log(`Listening on port ${port}`));