const express = require('express');
const logger = require('loglevel');
const uuid = require('uuid');

let packages;
let counters;

function getPackageRoutes(db) {
    packages = db.collection('packages');
    counters = db.collection('counters');

    const router = express.Router();

    router.post('/', insertPackage);
    router.get('/', getPackages);
    router.put('/', updatePackage);
    router.delete('/', deletePackage);

    return router;
}

async function getNextTrackingNumber() {
    const res = await counters.findOneAndUpdate(
        { _id: 'trackingnumber' },
        { $inc: { 'sequence_value': 1 } },
    );

    logger.info(res);

    return res.value['sequence_value'];
}

async function insertPackage(req, res) {
    console.log(req.body);
    packages.insertOne({
        ...req.body,
        _id: (await getNextTrackingNumber())
    })
        .then(result => {
            logger.info(result.ops);
            res.json(result);
        })
        .catch(err => {
            logger.error(err);
            res.statusCode = 500;
            res.json(err);
        })
}

async function getPackages(req, res) {
    const cursor = packages.find();
    cursor.toArray().then(arr => {
        logger.info(arr);
        res.json(arr);
    })
        .catch(err => {
            logger.error(err);
            res.statusCode = 500;
            res.json(err);
        });
}

async function updatePackage(req, res) {
    packages.findOneAndUpdate(
        { _id: req.body.id },
        {
            $set: {
                to: req.body.to,
                from: req.body.from
            }
        },
        {
            upsert: false
        }
    )
        .then(result => {
            res.json(result);
            logger.info(result);
        })
        .catch(err => {
            logger.error(err);
            res.statusCode = 500;
            res.json(err);
        })
}

async function deletePackage(req, res) {
    packages.findOneAndDelete(
        { _id: req.body.id }
    )
        .then(result => {
            res.json(result);
            logger.info(result);
        })
        .catch(err => {
            logger.error(err);
            res.statusCode = 500;
            res.json(err);
        });
}

module.exports = getPackageRoutes;