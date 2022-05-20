const DBConnection = require('../../database/DBConnection');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

module.exports = {
    validateMeal: (req, res, next) => {
        const meal = req.body;

        const schema = Joi.object({
            name: Joi.string().required().messages({
                'any.required': 'name is a required field',
            }),
            description: Joi.string().required().messages({
                'any.required': 'description is a required field',
            }),
            isActive: Joi.boolean().required().messages({
                'any.required': 'isActive is a required field',
            }),
            isVega: Joi.boolean().required().messages({
                'any.required': 'isVega is a required field',
            }),
            isVegan: Joi.boolean().required().messages({
                'any.required': 'isVegan is a required field',
            }),
            isToTakeHome: Joi.boolean().required().messages({
                'any.required': 'isToTakeHome is a required field',
            }),
            dateTime: Joi.string().required().messages({
                'any.required': 'dateTime is a required field',
            }),
            imageUrl: Joi.string().required().messages({
                'any.required': 'imageUrl is a required field',
            }),
            allergenes: Joi.array().items(Joi.string()).required().messages({
                'any.required': 'allergenes is a required field',
            }),
            maxAmountOfParticipants: Joi.number().required().messages({
                'any.required': 'maxAmountOfParticipants is a required field',
            }),
            price: Joi.number().required().messages({
                'any.required': 'price is a required field',
            }),
        });

        const { error } = schema.validate(meal);

        if (error) {
            next({
                statusCode: 400,
                message: error.message,
            });
        } else {
            next();
        }
    },

    getAllMeals: (req, res, next) => {
        DBConnection.getConnection((error, connection) => {
            if (error) {
                next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
            } else {
                connection.query(
                    'SELECT meal.id, name, description, meal.isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId, firstName, lastName, street, city, user.isActive as userIsActive, emailAdress, password, phoneNumber FROM `meal` INNER JOIN `user` ON cookId = user.id;',
                    (error, results, fields) => {
                        connection.release();
                        if (error) {
                            next({
                                statusCode: 500,
                                message: 'Internal servor error',
                            });
                        } else {
                            results = results.map((meal) => ({
                                id: meal.id,
                                name: meal.name,
                                description: meal.description,
                                isActive: meal.isActive,
                                isVega: meal.isVega,
                                isVegan: meal.isVegan,
                                isToTakeHome: meal.isToTakeHome,
                                dateTime: meal.dateTime,
                                imageUrl: meal.imageUrl,
                                maxAmountOfParticipants:
                                    meal.maxAmountOfParticipants,
                                price: meal.price,
                                allergenes: meal.allergenes.split(','),
                                cook: {
                                    id: meal.cookId,
                                    firstName: meal.firstName,
                                    lastName: meal.lastName,
                                    street: meal.street,
                                    city: meal.city,
                                    isActive: meal.userIsActive,
                                    emailAdress: meal.emailAdress,
                                    password: meal.password,
                                    phoneNumber: meal.phoneNumber,
                                },
                            }));

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

    getMeal: (req, res, next) => {
        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
                return;
            }

            connection.query(
                'SELECT meal.id, name, description, meal.isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId, firstName, lastName, street, city, user.isActive as userIsActive, emailAdress, password, phoneNumber FROM `meal` INNER JOIN `user` ON cookId = user.id WHERE meal.id = ?',
                req.params.id,
                (error, results, fields) => {
                    connection.release();

                    if (error) {
                        console.log(error);
                        next({
                            statusCode: 500,
                            message: 'Internal servor error',
                        });
                    } else if (!results.length > 0) {
                        next({
                            statusCode: 404,
                            message: 'Meal does not exist',
                        });
                    } else {
                        results = results.map((meal) => ({
                            id: meal.id,
                            name: meal.name,
                            description: meal.description,
                            isActive: meal.isActive,
                            isVega: meal.isVega,
                            isVegan: meal.isVegan,
                            isToTakeHome: meal.isToTakeHome,
                            dateTime: meal.dateTime,
                            imageUrl: meal.imageUrl,
                            maxAmountOfParticipants:
                                meal.maxAmountOfParticipants,
                            price: meal.price,
                            allergenes: meal.allergenes.split(','),
                            cook: {
                                id: meal.cookId,
                                firstName: meal.firstName,
                                lastName: meal.lastName,
                                street: meal.street,
                                city: meal.city,
                                isActive: meal.userIsActive,
                                emailAdress: meal.emailAdress,
                                password: meal.password,
                                phoneNumber: meal.phoneNumber,
                            },
                        }));

                        res.status(200).json({
                            statusCode: 200,
                            result: results[0],
                        });
                    }
                }
            );
        });
    },

    createMeal: (req, res, next) => {
        const {
            name,
            description,
            isActive,
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            imageUrl,
            allergenes,
            maxAmountOfParticipants,
            price,
        } = req.body;

        DBConnection.getConnection((err, connection) => {
            if (err) {
                return next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
            }

            const authHeader = req.headers.authorization;
            const token = authHeader.substring(7, authHeader.length);
            const decoded = jwt.decode(token);

            connection.query(
                'INSERT INTO `meal` (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId)' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
                [
                    name,
                    description,
                    isActive,
                    isVega,
                    isVegan,
                    isToTakeHome,
                    dateTime,
                    imageUrl,
                    allergenes.join(','),
                    maxAmountOfParticipants,
                    price,
                    decoded.id,
                ],
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
                            result: {
                                ...req.body,
                                id: results.insertId,
                            },
                        });
                    }
                }
            );
        });
    },

    updateMeal: (req, res, next) => {
        DBConnection.getConnection((err, connection) => {
            if (err) {
                connection.release();
                return next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
            }

            connection.query(
                'SELECT cookId from `meal` WHERE id = ?',
                req.params.id,
                (error, results, fields) => {
                    if (error) {
                        connection.release();
                        return next({
                            statusCode: 500,
                            result: 'Internal servor error',
                        });
                    }

                    const authHeader = req.headers.authorization;
                    const token = authHeader.substring(7, authHeader.length);
                    const decoded = jwt.decode(token);

                    if (!results.length > 0) {
                        connection.release();
                        return next({
                            statusCode: 404,
                            message: 'Meal does not exist',
                        });
                    }

                    if (decoded.id != results[0].cookId) {
                        connection.release();
                        return next({
                            statusCode: 403,
                            message: 'You are not the owner of this meal',
                        });
                    }

                    const keys = Object.keys(req.body);

                    const values = [];
                    keys.forEach((key) => {
                        if (key === 'allergenes') {
                            req.body[key] = req.body[key].join(',');
                        }
                        values.push(req.body[key]);
                    });

                    keys[keys.length - 1] += ' = ?';
                    const keyString = keys.join(' = ?, ');

                    connection.query(
                        'UPDATE `meal` SET ' + keyString + ' WHERE id = ?',
                        [...values, req.params.id],
                        (error, results, fields) => {
                            connection.release();

                            if (error) {
                                connection.release();
                                return next({
                                    statusCode: 500,
                                    message: 'Internal servor error',
                                });
                            }

                            next();
                        }
                    );
                }
            );
        });
    },

    deleteMeal: (req, res, next) => {
        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
                return;
            }

            connection.query(
                'SELECT cookId from `meal` WHERE id = ?',
                req.params.id,
                (error, results, fields) => {
                    if (error) {
                        connection.release();
                        return next({
                            statusCode: 500,
                            result: 'Internal servor error',
                        });
                    }

                    const authHeader = req.headers.authorization;
                    const token = authHeader.substring(7, authHeader.length);
                    const decoded = jwt.decode(token);

                    if (!results.length > 0) {
                        connection.release();
                        return next({
                            statusCode: 404,
                            message: 'Meal does not exist',
                        });
                    }

                    if (decoded.id != results[0].cookId) {
                        connection.release();
                        return next({
                            statusCode: 403,
                            message: 'You are not the owner of this meal',
                        });
                    }

                    connection.query(
                        'DELETE FROM `meal` WHERE id = ?;',
                        req.params.id,
                        (error, results, fields) => {
                            connection.release();
                            if (error) {
                                connection.release();
                                return next({
                                    statusCode: 500,
                                    message: 'Internal servor error',
                                });
                            }

                            connection.release();
                            res.status(200).json({
                                statusCode: 200,
                                message: 'Meal deleted',
                            });
                        }
                    );
                }
            );
        });
    },
};
