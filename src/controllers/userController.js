const assert = require('assert');
const database = require('../database/db');

module.exports = {
    validateUser: (req, res, next) => {
        const user = req.body;
        const { email, password } = user;

        try {
            assert(typeof email === 'string', 'Email must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            next();
        } catch (err) {
            next({
                status: 400,
                result: err.message
            });
        }
    },

    listUsers: (req, res) => {
        database.listUsers((result) => {
            res.status(200).json({
                status: 200,
                result
            });
        });
    },

    createUser: (req, res, next) => {
        database.createUser(req.body, (error, result) => {
            if (error) {
                next({
                    status: 400,
                    result: error
                });
            } else {
                res.status(200).json({
                    status: 200,
                    result
                });
            }
        });
    },

    getUserProfile: (req, res) => {
        next({
            status: 400,
            result: 'Functionality has not been implemented yet.'
        });
    },

    getUser: (req, res) => {
        database.getUser(req.params.id, (result) => {
            res.status(200).json({
                status: 200,
                result
            });
        });
    },

    updateUser: (req, res, next) => {
        database.updateUser(req.body, req.params.id, (error, result) => {
            if (error) {
                next({
                    status: 400,
                    result: error
                });
            } else {
                res.status(200).json({
                    status: 200,
                    result
                });
            }
        });
    },

    deleteUser: (req, res, next) => {
        database.deleteUser(req.params.id, (error, result) => {
            if (error) {
                next({
                    status: 400,
                    result: error
                });
            } else {
                res.status(200).json({
                    status: 200,
                    result
                });
            }
        });
    }
}