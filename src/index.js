const express = require('express');

var usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/user', usersRouter);

app.use('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    })
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});