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
                'base.string': 'description is a required field',
            }),
            isActive: Joi.boolean().messages({
                'base.boolean': 'isActive should be a boolean',
            }),
            isVega: Joi.boolean().messages({
                'base.boolean': 'isVega should be a boolean',
            }),
            isVegan: Joi.boolean().messages({
                'base.boolean': 'isVegan should be a boolean',
            }),
            isToTakeHome: Joi.boolean().messages({
                'base.boolean': 'isToTakeHome should be a boolean',
            }),
            dateTime: Joi.string().messages({
                'base.string': 'dateTime should be a string',
            }),
            imageUrl: Joi.string().messages({
                'base.string': 'imageUrl should be a string',
            }),
            allergenes: Joi.array().items(Joi.string()).required().messages({
                'base.array': 'allergenes should be an array of strings',
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

    validateUpdatedMeal: (req, res, next) => {
        const meal = req.body;

        const schema = Joi.object({
            name: Joi.string().required.messages({
                'any.required': 'name is a required field',
            }),
            description: Joi.string().messages({
                'base.string': 'description should be a string',
            }),
            isActive: Joi.boolean().messages({
                'base.string': 'isActive should be a string',
            }),
            isVega: Joi.boolean().messages({
                'base.string': 'isVega should be a string',
            }),
            isVegan: Joi.boolean().messages({
                'base.string': 'isVegan should be a string',
            }),
            isToTakeHome: Joi.boolean().messages({
                'base.string': 'isToTakeHome should be a string',
            }),
            dateTime: Joi.string().messages({
                'base.string': 'dateTime should be a string',
            }),
            imageUrl: Joi.string().messages({
                'base.string': 'imageUrl should be a string',
            }),
            allergenes: Joi.array().items(Joi.string()).messages({
                'base.string': 'allergenes should be a string',
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
                    'SELECT meal.id, name, mealId, user.id as userId, description, meal.isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId, firstName, lastName, street, city, user.isActive as userIsActive, emailAdress, password, phoneNumber FROM `meal` LEFT JOIN meal_participants_user ON mealId = meal.id LEFT JOIN user ON userId = user.id;',
                    (error, results, fields) => {
                        connection.release();
                        if (error) {
                            next({
                                statusCode: 500,
                                message: 'Internal servor error',
                            });
                        } else {
                            const meals = [];
                            results.forEach((meal_user) => {
                                if (
                                    !meals.find(
                                        (meal) => meal.id === meal_user.id
                                    )
                                ) {
                                    meals.push({
                                        id: meal_user.id,
                                        name: meal_user.name,
                                        description: meal_user.description,
                                        isActive: Boolean(meal_user.isActive),
                                        isVega: Boolean(meal_user.isVega),
                                        isVegan: Boolean(meal_user.isVegan),
                                        isToTakeHome: Boolean(
                                            meal_user.isToTakeHome
                                        ),
                                        dateTime: meal_user.dateTime,
                                        imageUrl: meal_user.imageUrl,
                                        maxAmountOfParticipants:
                                            meal_user.maxAmountOfParticipants,
                                        price: Number(meal_user.price),
                                        allergenes:
                                            meal_user.allergenes.split(','),
                                        cook: {},
                                        participants: [],
                                    });
                                }

                                if (meal_user.userId != null) {
                                    const index = meals.findIndex(
                                        (meal) => meal.id === meal_user.id
                                    );

                                    const user = {
                                        id: meal_user.userId,
                                        firstName: meal_user.firstName,
                                        lastName: meal_user.lastName,
                                        street: meal_user.street,
                                        city: meal_user.city,
                                        isActive: Boolean(
                                            meal_user.userIsActive
                                        ),
                                        emailAdress: meal_user.emailAdress,
                                        password: meal_user.password,
                                        phoneNumber: meal_user.phoneNumber,
                                    };

                                    meals[index].participants.push(user);

                                    if (meal_user.cookId === meal_user.userId) {
                                        meals[index].cook = user;
                                    }
                                }
                            });

                            res.status(200).json({
                                statusCode: 200,
                                result: meals,
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
                'SELECT meal.id, name, mealId, user.id as userId, description, meal.isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cookId, firstName, lastName, street, city, user.isActive as userIsActive, emailAdress, password, phoneNumber FROM `meal` LEFT JOIN meal_participants_user ON mealId = meal.id LEFT JOIN user ON userId = user.id WHERE meal.id = ?',
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
                            message: 'Meal does not exist',
                        });
                    } else {
                        const meals = {
                            id: results[0].id,
                            name: results[0].name,
                            description: results[0].description,
                            isActive: Boolean(results[0].isActive),
                            isVega: Boolean(results[0].isVega),
                            isVegan: Boolean(results[0].isVegan),
                            isToTakeHome: Boolean(results[0].isToTakeHome),
                            dateTime: results[0].dateTime,
                            imageUrl: results[0].imageUrl,
                            maxAmountOfParticipants:
                                results[0].maxAmountOfParticipants,
                            price: Number(results[0].price),
                            allergenes: results[0].allergenes.split(','),
                            cook: {},
                            participants: [],
                        };

                        if (results[0].mealId) {
                            meals.participants = results.map((user) => ({
                                id: user.userId,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                street: user.street,
                                city: user.city,
                                isActive: Boolean(user.userIsActive),
                                emailAdress: user.emailAdress,
                                password: user.password,
                                phoneNumber: user.phoneNumber,
                            }));
                        }

                        meals.cook =
                            meals.participants.find(
                                (user) => user.id === results[0].cookId
                            ) ?? {};

                        res.status(200).json({
                            statusCode: 200,
                            result: meals,
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
                    if (error) {
                        console.log(error);
                        next({
                            statusCode: 500,
                            message: 'Internal servor error',
                        });
                    } else {
                        const mealId = results.insertId;

                        DBConnection.query(
                            'INSERT INTO `meal_participants_user` (mealId, userId) VALUES (?, ?);',
                            [mealId, decoded.id],
                            (error, results, fields) => {
                                connection.release();

                                if (error) {
                                    console.log(error);
                                    next({
                                        statusCode: 500,
                                        message: 'Internal servor error',
                                    });
                                }

                                res.status(200).json({
                                    statusCode: 200,
                                    result: {
                                        ...req.body,
                                        id: mealId,
                                    },
                                });
                            }
                        );
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

    participateMeal: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7, authHeader.length);
        const decoded = jwt.decode(token);

        DBConnection.getConnection((err, connection) => {
            if (err) {
                next({
                    statusCode: 500,
                    message: 'Internal servor error',
                });
                return;
            }

            connection.query(
                'SELECT * FROM `meal_participants_user` WHERE mealId = ?',
                req.params.id,
                (error, results, fields) => {
                    if (error) {
                        return next({
                            statusCode: 500,
                            message: 'Internal server error',
                        });
                    }

                    if (!results.length > 0) {
                        return next({
                            statusCode: 404,
                            message: 'Meal does not exist',
                        });
                    }

                    connection.query(
                        'SELECT COUNT(*) as count FROM `meal_participants_user` WHERE mealId = ?',
                        req.params.id,
                        (error, results, fields) => {
                            const count = results[0].count;

                            connection.query(
                                'DELETE from `meal_participants_user` WHERE userId = ? AND mealId = ?',
                                [decoded.id, req.params.id],
                                (error, results, fields) => {
                                    if (error) {
                                        return next({
                                            statusCode: 500,
                                            result: 'Internal servor error',
                                        });
                                    }

                                    if (results.affectedRows > 0) {
                                        res.status(200).json({
                                            statusCode: 200,
                                            result: {
                                                currentlyParticipating: false,
                                                currentAmountOfParticipants:
                                                    count - 1,
                                            },
                                        });
                                    } else {
                                        connection.query(
                                            'INSERT INTO `meal_participants_user` (userId, mealId) VALUES (?, ?);',
                                            [decoded.id, req.params.id],
                                            (error, results, fields) => {
                                                connection.close();

                                                if (error) {
                                                    return next({
                                                        statusCode: 500,
                                                        result: 'Internal servor error',
                                                    });
                                                }

                                                res.status(200).json({
                                                    statusCode: 200,
                                                    result: {
                                                        currentlyParticipating: true,
                                                        currentAmountOfParticipants:
                                                            count + 1,
                                                    },
                                                });
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                }
            );
        });
    },
};
