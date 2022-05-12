const DBConnection = require('../../database/DBConnection');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    validateLogin: (req, res, next) => {
        const schema = Joi.object({
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
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

                        if (user.password === password) {
                            jwt.sign(
                                { userId: user.id },
                                process.env.JWT_SECRET,
                                { expiresIn: '7d' },
                                (error, token) => {
                                    if (error) {
                                        next({
                                            statusCode: 500,
                                            message: 'Internal server error.',
                                        });
                                    }

                                    res.status(200).json({
                                        statusCode: 200,
                                        result: token,
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
                }
            );
        });
    },
};
