const express = require('express');
const usersRouter = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/user', usersRouter);

app.use('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    });
});

app.use((error, req, res, next) => {
    res.status(error.statusCode).json(error);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

module.exports = app;
