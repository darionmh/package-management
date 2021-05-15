const express = require('express');
const uuid = require('uuid');

function getPackageRoutes(db) {
    const packages = db.collection('packages');

    const router = express.Router();

    router.post('/', (req, res) => insertPackage(req, res, packages));
    router.get('/', (req, res) => getPackages(req, res, packages));
    router.put('/', (req, res) => updatePackage(req, res, packages));
    router.delete('/', (req, res) => deletePackage(req, res, packages));
    
    return router;
}

async function insertPackage(req, res, packages) {
    console.log(req.body);
    packages.insertOne({
        ...req.body,
        id: uuid.v4()
    })
        .then(result => {
            console.log(result.ops);
            res.json(result);
        })
        .catch(err => {
            res.statusCode = 500;
            res.json(err);
        })
}

async function getPackages(req, res, packages) {
    const cursor = packages.find();
    cursor.toArray().then(arr => {
        console.log(arr);
        res.json(arr);
    })
        .catch(err => {
            res.statusCode = 500;
            res.json(err);
        });
}

async function updatePackage(req, res, packages) {
    packages.findOneAndUpdate(
        { id: req.body.id },
        {
            $set: {
                to: req.body.to,
                from: req.body.from
            }
        },
        {
            upsert: true
        }
    )
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        res.statusCode = 500;
        res.json(err);
    })
}

async function deletePackage(req, res, packages) {
    packages.findOneAndDelete(
        {id: req.body.id}
    )
    .then(result => res.json(result))
    .catch(err => {
        console.error(err);
        res.statusCode = 500;
        res.json(err);
    });
}

module.exports = getPackageRoutes;