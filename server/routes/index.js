const express = require('express');
const getPackageRoutes = require('./package');

function getRoutes(db) {
    const router = express.Router();
    router.use('/package', getPackageRoutes(db))

    return router;
}

module.exports = getRoutes;