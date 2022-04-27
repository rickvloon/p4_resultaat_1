const express = require('express');
const router = express.Router();

const database = require('../database/db');

router.get('/', (req, res) => {
    database.listUsers((result) => {
        res.status(200).json({
            statusCode: 200,
            result
        });
    });
});

router.post('/', (req, res) => {
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

router.get('/profile', (req, res) => {
    res.status(401).json({
        statusCode: 401,
        error: "Functionality has not been implemented yet."
    });
});

router.get('/:id', (req, res) => {
    database.retrieveUser(req.params.id, (result) => {
        res.status(200).json({
            statusCode: 200,
            result
        })
    });
});

router.put('/:id', (req, res) => {
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


router.delete('/:id', (req, res) => {
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


module.exports = router;