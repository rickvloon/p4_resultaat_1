const DBConnection = require('../../database/DBConnection');
const Joi = require('joi');

module.exports = {
    validateUser: (req, res, next) => {
        const user = req.body;

        const schema = Joi.object({
            firstName: Joi.string()
                .required()
                .messages({
                    'any.required': 'firstName is a required field',
                }),
            lastName: Joi.string()
                .required()
                .messages({
                    'any.required': 'lastName is a required field',
                }),
            street: Joi.string()
                .required()
                .messages({
                    'any.required': 'street is a required field',
                }),
            city: Joi.string()
                .required()
                .messages({
                    'any.required': 'city is a required field',
                }),
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
                .required()
                .messages({
                    'string.base': 'password should be a string',
                    'any.required': 'password is a required field',
                    'string.pattern.base': 'password must be a valid password',
                }),
            emailAddress: Joi.string()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: ['com', 'net', 'eu', 'nl'] },
                })
                .required()
                .messages({
                    'string.base': 'emailAddress should be a string',
                    'any.required': 'emailAddress is a required field',
                    'string.email': 'emailAddress must be a valid email',
                }),
        });

        const { error } = schema.validate(user);

        if (error) {
            next({
                statusCode: 400,
                result: error.message,
            });
        } else {
            next();
        }
    },

    getAllUsers: (req, res) => {
        DBConnection.getConnection((err, connection) => {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                'SELECT * FROM user;',
                (error, results, fields) => {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    console.log('#results = ', results.length);
                    res.status(200).json({
                        statusCode: 200,
                        result: results,
                    });
                }
            );
        });
    },

    createUser: (req, res, next) => {
        database.createUser(req.body, (error, result) => {
            if (error) {
                next({
                    statusCode: 400,
                    result: error,
                });
            } else {
                res.status(200).json({
                    statusCode: 200,
                    result,
                });
            }
        });
    },

    getUserProfile: (req, res) => {
        next({
            status: 400,
            result: 'Functionality has not been implemented yet.',
        });
    },

    getUser: (req, res) => {
        database.getUser(req.params.id, (result) => {
            res.status(200).json({
                statusCode: 200,
                result,
            });
        });
    },

    updateUser: (req, res, next) => {
        database.updateUser(req.body, req.params.id, (error, result) => {
            if (error) {
                next({
                    statusCode: 400,
                    result: error,
                });
            } else {
                res.status(200).json({
                    statusCode: 200,
                    result,
                });
            }
        });
    },

    deleteUser: (req, res, next) => {
        database.deleteUser(req.params.id, (error, result) => {
            if (error) {
                next({
                    statusCode: 400,
                    result: error,
                });
            } else {
                res.status(200).json({
                    statusCode: 200,
                    result,
                });
            }
        });
    },
};
