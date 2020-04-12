exports.port = process.env.PORT || 3003;
exports.databaseConnectionString = process.env.DATABASE_CONNECTION_STRING;
exports.nodeENV = process.env.NODE_ENV
exports.sessionSecret = process.env.SESSION_SECRET || 'secret';