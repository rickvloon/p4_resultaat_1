const DBConnection = require('../../database/DBConnection');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
    validateLogin: (req, res, next) => {
        const schema = Joi.object({
            password: Joi.string()
                .pattern(/^(?=.*\d)(?=.*[A-Z]).{8,}$/)
                .required()
                .messages({
                    'string.base': 'password should be a string',
                    'any.required': 'password is a required field',
                    'string.pattern.base': 'password must be a valid password',
                }),
            emailAdress: Joi.string()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: ['com', 'net', 'eu', 'nl'] },
                })
                .required()
                .messages({
                    'string.base': 'emailAdress should be a string',
                    'any.required': 'emailAdress is a required field',
                    'string.email': 'emailAdress must be a valid email',
                }),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            next({
                statusCode: 400,
                message: error.message,
            });
        } else {
            next();
        }
    },

    validateToken: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            next({
                statusCode: 401,
                message: 'Unauthorized',
            });
        } else {
            const token = authHeader.substring(7, authHeader.length);

            jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
                if (error) {
                    next({
                        statusCode: 401,
                        message: 'Unauthorized',
                    });
                }

                if (payload) {
                    req.body.id = payload.id;
                    next();
                }
            });
        }
    },

    login: (req, res, next) => {
        const { emailAdress, password } = req.body;

        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
                return;
            }

            connection.query(
                'SELECT id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber FROM `user` WHERE emailAdress = ?;',
                emailAdress,
                (error, results, fields) => {
                    connection.release();

                    if (error) {
                        next({
                            statusCode: 500,
                            message: 'Internal servor error',
                        });
                    } else if (results && !results.length > 0) {
                        next({
                            statusCode: 400,
                            message: 'User does not exist.',
                        });
                    } else {
                        const user = results[0];

                        bcrypt.compare(
                            password,
                            user.password,
                            (err, result) => {
                                if (err) {
                                    return next({
                                        statusCode: 500,
                                        message: 'Internal server error.',
                                    });
                                }

                                if (result) {
                                    jwt.sign(
                                        { id: user.id },
                                        process.env.JWT_SECRET,
                                        { expiresIn: '7d' },
                                        (error, token) => {
                                            if (error) {
                                                return next({
                                                    statusCode: 500,
                                                    message:
                                                        'Internal server error.',
                                                });
                                            }

                                            res.status(200).json({
                                                statusCode: 200,
                                                result: {
                                                    ...results[0],
                                                    token,
                                                },
                                            });
                                        }
                                    );
                                } else {
                                    next({
                                        statusCode: 400,
                                        message: 'Invalid credentials.',
                                    });
                                }
                            }
                        );
                    }
                }
            );
        });
    },
};
