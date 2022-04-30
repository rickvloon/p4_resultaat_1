const database = require('../database/db');
const Joi = require('joi');

module.exports = {
    listUsers: (req, res) => {
        database.listUsers((result) => {
            res.status(200).json({
                statusCode: 200,
                result
            });
        });
    },

    createUser: (req, res, next) => {
        database.createUser(req.body, (error, result) => {
            if (error) {
                next({
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
        next({
            statusCode: 400,
            error: 'Functionality has not been implemented yet.'
        });
    },

    getUser: (req, res) => {
        database.getUser(req.params.id, (result) => {
            res.status(200).json({
                statusCode: 200,
                result
            });
        });
    },

    updateUser: (req, res, next) => {
        database.updateUser(req.body, req.params.id, (error, result) => {
            if (error) {
                next({
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

    deleteUser: (req, res, next) => {
        database.deleteUser(req.params.id, (error, result) => {
            if (error) {
                next({
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

    validateUser: (req, res, next) => {
        const user = req.body;

        const userSchema = Joi.object({
            firstName: Joi.string(),
            lastName: Joi.string(),
            street: Joi.string(),
            city: Joi.string(),
            emailAddress: Joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'nl', 'eu'] } }),
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        });

        const { error } = userSchema.validate(user);
        if (error) {
            next({
                status: 404,
                error: error.details[0].message
            });
        } else {
            next();
        }
    }
}