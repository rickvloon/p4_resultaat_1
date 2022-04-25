const express = require('express');
const database = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/user', (req, res) => {
    database.listUsers((result) => {
        res.status(200).json({
            statusCode: 200,
            result
        });
    });
});

app.get('/api/user/profile', (req, res) => {
    res.status(401).json({
        statusCode: 401,
        error: "Functionality has not been implemented yet."
    });
});

app.get('/api/user/:id', (req, res) => {
    database.retrieveUser(req.params.id, (result) => {
        res.status(200).json({
            statusCode: 200,
            result
        })
    });
});

app.post('/api/user', (req, res) => {
    database.createUser(req.body, (error, result) => {
        if (error) {
            res.status(400).json({
                statusCode: 400,
                error
            });
        } else {
            res.status(200).json({
                statusCode: 200,
                result
            });
        }
    })
});

app.put('/api/user/:id', (req, res) => {
    database.updateUser(req.body, req.params.id, (error, result) => {
        if (error) {
            res.status(400).json({
                statusCode: 400,
                error
            });
        } else {
            res.status(200).json({
                statusCode: 200,
                result
            });
        }
    });
});

app.delete('/api/user/:id', (req, res) => {
    database.deleteUser(req.params.id, (error, result) => {
        if (error) {
            res.status(400).json({
                statusCode: 400,
                error
            });
        } else {
            res.status(200).json({
                statusCode: 200,
                result
            });
        }
    });
});

app.use('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});