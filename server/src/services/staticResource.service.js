const express = require('express');
const path = require('path');

exports.configureStaticResources = function(app) {
    const assetsPath = path.resolve(__dirname, '..', '..', '..', 'client', 'build');
    const entrypoint = path.resolve(assetsPath, 'index.html');
    app.use('/', express.static(assetsPath))
    app.get('/architect', (_, res) => res.sendFile(entrypoint))
    app.get('/lobby/:id', (_, res) => res.sendFile(entrypoint))
    app.get('/game/:id', (_, res) => res.sendFile(entrypoint))
}