const express = require('express');
const path = require('path');

exports.configureStaticResources = function(app) {
    const assetsPath = path.resolve(__dirname, '..', '..', '..', 'client', 'build');
    const staticPath = path.resolve(assetsPath, 'static');
    const entrypoint = path.resolve(assetsPath, 'index.html');

    const respondWithEntrypoint = (_, res) => res.sendFile(entrypoint);

    app.use('/static', express.static(staticPath))
    app.get('/', respondWithEntrypoint)
    app.get('/game/:id', respondWithEntrypoint)
    app.get('/play/:id', respondWithEntrypoint)
}