const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/user', (req, res) => {
    res.send('Test im a loser');
});

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
});