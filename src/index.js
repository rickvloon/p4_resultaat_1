const express = require('express');
const usersRouter = require('./routes/user');
const mealRouter = require('./routes/meal');
const authRouter = require('./routes/authentication');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use('/api/user', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/meal', mealRouter);

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
