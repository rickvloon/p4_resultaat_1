const DBConnection = require('../../database/DBConnection');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
    validateUser: (req, res, next) => {
        const user = req.body;

        const schema = Joi.object({
            firstName: Joi.string().required().messages({
                'any.required': 'firstName is a required field',
            }),
            lastName: Joi.string().required().messages({
                'any.required': 'lastName is a required field',
            }),
            street: Joi.string().required().messages({
                'any.required': 'street is a required field',
            }),
            city: Joi.string().required().messages({
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
            isActive: Joi.boolean().required().messages({
                'boolean.base': 'isActive should be a boolean',
                'any.required': 'isActive is a required field',
            }),
            phoneNumber: Joi.string().required().messages({
                'any.required': 'phoneNumber is a required field',
            }),
            emailAdress: Joi.string()
                .email({
                    minDomainSegments: 1,
                    tlds: { allow: ['nl'] },
                })
                .required()
                .messages({
                    'string.base': 'emailAdress should be a string',
                    'any.required': 'emailAdress is a required field',
                    'string.email': 'emailAdress must be a valid email',
                }),
            id: Joi.number().messages({
                'number.base': 'id should be a number',
            }),
        });

        const { error } = schema.validate(user);

        if (error) {
            next({
                statusCode: 400,
                message: error.message,
            });
        } else {
            next();
        }
    },

    getAllUsers: (req, res, next) => {
        let { name, isActive } = req.query;

        let queryString = 'SELECT * FROM `user`';

        if (name || isActive) {
            queryString += ' WHERE ';
            if (name) {
                queryString += 'firstName LIKE ?';
                name = '%' + name + '%';
            }

            if (name && isActive) queryString += ' AND ';
            if (isActive) {
                queryString += '`isActive` = ?';
            }
        }

        DBConnection.getConnection((error, connection) => {
            if (error) {
                next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
            } else {
                connection.query(
                    queryString,
                    [name, isActive].filter((v) => v != null),
                    (error, results, fields) => {
                        connection.release();

                        if (error) {
                            next({
                                statusCode: 500,
                                message: 'Internal servor error',
                            });
                        } else {
                            res.status(200).json({
                                statusCode: 200,
                                result: results,
                            });
                        }
                    }
                );
            }
        });
    },

    createUser: (req, res, next) => {
        DBConnection.getConnection((err, connection) => {
            if (err) {
                return next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
            }

            const { firstName, lastName, street, city, password, emailAdress } =
                req.body;

            connection.query(
                'SELECT * FROM `user` WHERE emailAdress = ?;',
                emailAdress,
                (error, results, fields) => {
                    if (error) {
                        next({
                            statusCode: 500,
                            message: 'Internal server error.',
                        });
                    } else if (results.length > 0) {
                        next({
                            statusCode: 409,
                            message: 'User is already registered.',
                        });
                    } else {
                        bcrypt.hash(password, 10, (err, hash) => {
                            if (err) {
                                return next({
                                    statusCode: 500,
                                    message: 'Internal server error',
                                });
                            }

                            connection.query(
                                'INSERT INTO `user` (firstName, lastName, street, city, emailAdress, password) VALUES (?, ?, ?, ?, ?, ?);',
                                [
                                    firstName,
                                    lastName,
                                    street,
                                    city,
                                    emailAdress,
                                    hash,
                                ],
                                (error, results, fields) => {
                                    connection.release();

                                    if (error) {
                                        next({
                                            statusCode: 500,
                                            message: 'Internal servor error',
                                        });
                                    } else {
                                        res.status(201).json({
                                            statusCode: 201,
                                            result: {
                                                id: results.insertId,
                                                ...req.body,
                                            },
                                        });
                                    }
                                }
                            );
                        });
                    }
                }
            );
        });
    },

    getUserProfile: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.decode(token);

        DBConnection.getConnection((err, connection) => {
            if (err) {
                return next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
            }

            connection.query(
                'SELECT * FROM `user` WHERE id = ?;',
                decoded.id,
                (error, results, fields) => {
                    connection.release();

                    if (error) {
                        next({
                            statusCode: 500,
                            message: 'Internal servor error',
                        });
                    } else if (!results.length > 0) {
                        next({
                            statusCode: 404,
                            message: 'User is not registered.',
                        });
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            result: results[0],
                        });
                    }
                }
            );
        });
    },

    getUser: (req, res, next) => {
        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
                return;
            }

            connection.query(
                'SELECT * FROM `user` WHERE id = ?;',
                req.params.id,
                (error, results, fields) => {
                    connection.release();

                    if (error) {
                        next({
                            statusCode: 500,
                            message: 'Internal servor error',
                        });
                    } else if (!results.length > 0) {
                        next({
                            statusCode: 404,
                            message: 'User is not registered.',
                        });
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            result: results[0],
                        });
                    }
                }
            );
        });
    },

    updateUser: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.decode(token);

        if (decoded.id != req.params.id) {
            return next({
                statusCode: 401,
                message: 'Unauthorized',
            });
        }

        DBConnection.getConnection((error, connection) => {
            if (error) {
                return next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
            }

            const {
                firstName,
                lastName,
                street,
                city,
                password,
                emailAdress,
                phoneNumber,
            } = req.body;

            const isActive = req.body.isActive ? 1 : 0;

            connection.query(
                'SELECT * FROM `user` WHERE id = ?;',
                req.params.id,
                (error, results, fields) => {
                    if (error) {
                        next({
                            statusCode: 500,
                            message: 'Internal server error.',
                        });
                    } else if (!results.length > 0) {
                        next({
                            statusCode: 400,
                            message: 'User is not registered.',
                        });
                    } else {
                        connection.query(
                            'SELECT count(emailAdress) as count from user WHERE emailAdress = ? AND id <> ?',
                            [emailAdress, req.params.id],
                            (error, results, fields) => {
                                if (error) {
                                    next({
                                        statusCode: 500,
                                        message: 'Internal server error',
                                    });
                                } else if (results[0].count >= 1) {
                                    next({
                                        statusCode: 400,
                                        message: 'Email is already registered',
                                    });
                                } else {
                                    connection.query(
                                        'UPDATE `user` SET firstName = ?, lastName = ?, street = ?, city = ?, emailAdress = ?, password = ?, isActive = ?, phoneNumber = ? WHERE id = ?;',
                                        [
                                            firstName,
                                            lastName,
                                            street,
                                            city,
                                            emailAdress,
                                            password,
                                            isActive,
                                            phoneNumber,
                                            req.params.id,
                                        ],
                                        (error, results, fields) => {
                                            connection.release();

                                            if (error) {
                                                next({
                                                    statusCode: 500,
                                                    result: 'Internal servor error',
                                                });
                                            } else {
                                                res.status(200).json({
                                                    statusCode: 200,
                                                    result: {
                                                        ...req.body,
                                                        id: decoded.id
                                                    },
                                                });
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                }
            );
        });
    },

    deleteUser: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.decode(token);

        if (decoded.id != req.params.id) {
            return next({
                statusCode: 403,
                message: 'Unauthorized',
            });
        }
        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    result: 'Internal servor error',
                });
                return;
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?;',
                req.params.id,
                (error, results, fields) => {
                    connection.release();
                    if (error) {
                        next({
                            statusCode: 500,
                            result: 'Internal servor error',
                        });
                    } else if (!results.affectedRows > 0) {
                        next({
                            statusCode: 400,
                            message: 'User does not exist',
                        });
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            message: 'User deleted',
                        });
                    }
                }
            );
        });
    },
};
