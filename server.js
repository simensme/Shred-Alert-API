const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { testQuery } = require('./services/database');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
    const test = await testQuery();
    res.send(test);
});

// Listening to server
app.listen(PORT, () => {
    console.log(`The application is now listening to ${PORT}`)
})