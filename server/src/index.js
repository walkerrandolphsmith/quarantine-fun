require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const gameController = require('./controllers/game.controller');
const { createSocketsManager } = require('./services/socketManager.service');
const { configureDatabase } = require('./services/databaseManager.service');
const { configureStaticResources } = require('./services/staticResource.service');
const { port } = require('./environment');


configureDatabase();
const app = express();
configureStaticResources(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/getCandidateGame', gameController.getCandidateGame);
app.get('/api/replaceCard', gameController.replaceCard);
app.post('/api/createGame', gameController.persistsGame);
app.get('/api/game/:id', gameController.getGame);
app.get('/api/play/:id', gameController.playGame);


const server = http.createServer(app);
const socketManager = createSocketsManager(server);
socketManager.on('cardselection', gameController.handleCardSelection)

server.listen(port, () => console.log(`Listening on port ${port}`));