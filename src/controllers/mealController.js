const DBConnection = require('../../database/DBConnection');

module.exports = {
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
                next({
                    statusCode: 500,
                    message: 'Internal server error',
                });
                return;
            }

            connection.query(
                'INSERT INTO `meal` (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price)' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
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
                                id: results.insertId,
                                ...req.body,
                            },
                        });
                    }
                }
            );
        });
    },
};
