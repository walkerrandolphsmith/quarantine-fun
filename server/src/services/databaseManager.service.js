const mongoose = require('mongoose');
const { error } = require('./log.service');
const { databaseConnectionString } = require('../environment');


exports.configureDatabase = function() {
    mongoose.Promise = global.Promise;
    return mongoose.connect(databaseConnectionString, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .catch(e => error(e));
}