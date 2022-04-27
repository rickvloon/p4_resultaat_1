const database = require('../database/db');

module.exports = {
    listUsers: (req, res) => {
        database.listUsers((result) => {
            res.status(200).json({
                statusCode: 200,
                result
            });
        });
    },

    createUser: (req, res) => {
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
        });
    },

    getUserProfile: (req, res) => {
        res.status(401).json({
            statusCode: 401,
            error: "Functionality has not been implemented yet."
        });
    },

    getUser: (req, res) => {
        database.getUser(req.params.id, (result) => {
            res.status(200).json({
                statusCode: 200,
                result
            })
        });
    },

    updateUser: (req, res) => {
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
    },

    deleteUser: (req, res) => {
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
    }
}