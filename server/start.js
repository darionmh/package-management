const express = require('express');
require('express-async-errors');
const logger = require('loglevel');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'localhost:27017';
const uri = `mongodb://${MONGO_URL}/test`;

const getRoutes = require('./routes');

function startServer() {
    const PORT = process.env.PORT || 3001;
    const app = express();

    app.use(express.static(path.resolve(__dirname, '../client/build')));
    app.use(express.json({ extended: true }));
    app.use(express.urlencoded({ extended: true }));
    app.use(errorMiddleware);

    MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) return logger.error(err);
        logger.log('Connected to Database');
        const db = client.db('test');

        const server = app.listen(PORT, () => {
            logger.info(`Listening on port ${server.address().port}`);

            app.use('/api', getRoutes(db));

            app.get('*', (req, res) => {
                res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
            });
        });
    });
}

function errorMiddleware(error, req, res, next) {
    if (res.headersSent) {
        next(error);
    } else {
        logger.error(error);
        res.status(500);
        res.json({
            message: error.message,
            ...(process.env.NODE_ENV === 'production' ? null : { stack: error.stack }),
        });
    }
}

module.exports = startServer;