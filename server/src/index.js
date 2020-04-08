process.env.NODE_ENV !== 'production' && require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/getCandidateGame/:category', gameController.getCandidateGame);
app.get('/api/getCandidateGame', gameController.getCandidateGame);
app.get('/api/replaceCard', gameController.replaceCard);
app.get('/api/replaceCard/:category', gameController.replaceCard);
app.post('/api/createGame', gameController.persistsGame);
app.get('/api/game/:id', gameController.getGame);
app.get('/api/play/:id', gameController.playGame);


const server = http.createServer(app);
const socketManager = createSocketsManager(server);
socketManager.on('cardselection', gameController.handleCardSelection)

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