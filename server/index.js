const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const uuid = require('uuid');

const PORT = process.env.PORT || 3001;

const app = express();

const uri = 'mongodb://localhost:27017/test';
const client = new MongoClient(uri);

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json({extended: true}));
app.use(express.urlencoded({extended: true}));

app.get('/api', (req, res) => {
    res.json({ message: 'Hello World 3' });
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) return console.error(err);
        console.log('Connected to Database');
        const db = client.db('test');
        const packages = db.collection('packages');

        app.post('/packages', (req, res) => {
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
        });

        app.get('/packages', (req, res) => {
            const cursor = packages.find();
            cursor.toArray().then(arr => {
                console.log(arr);
                res.json(arr);
            })
                .catch(err => {
                    res.statusCode = 500;
                    res.json(err);
                });
        });

        app.put('/packages', (req, res) => {
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
        });

        app.delete('/packages', (req, res) => {
            packages.findOneAndDelete(
                {id: req.body.id}
            )
            .then(result => res.json(result))
            .catch(err => {
                console.error(err);
                res.statusCode = 500;
                res.json(err);
            });
        });

        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
        });
    });
});