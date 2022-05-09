const database = require("../database/db");
const Joi = require("joi");

module.exports = {
    validateUser: (req, res, next) => {
        const user = req.body;

        const schema = Joi.object({
            password: Joi.string()
                .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
                .required()
                .messages({
                    "string.base": "password should be a string",
                    "any.required": "password is a required field",
                    "string.pattern.base": "password must be a valid password",
                }),
            emailAddress: Joi.string()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: ["com", "net", "eu", "nl"] },
                })
                .required()
                .messages({
                    "string.base": "emailAddress should be a string",
                    "any.required": "emailAddress is a required field",
                    "string.email": "emailAddress must be a valid email",
                }),
        }).unknown(true);

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

    listUsers: (req, res) => {
        database.listUsers((result) => {
            res.status(200).json({
                statusCode: 200,
                result,
            });
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
            result: "Functionality has not been implemented yet.",
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
