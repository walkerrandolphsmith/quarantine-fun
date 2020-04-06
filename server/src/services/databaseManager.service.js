const mongoose = require('mongoose');
const { databaseConnectionString } = require('../environment');

exports.configureDatabase = function() {
    mongoose.Promise = global.Promise;
    return mongoose.connect(databaseConnectionString, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
}