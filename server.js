// ENV
require('dotenv').config();

// REQUIRE
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const path = require('path')
const port = process.env.PORT || 8080;

// EXPRESS
const app = express();

app.use(fileUpload());
app.use(express.json());

// ROUTES
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// PRODUCTION
if (process.env.NODE_ENV === 'production') {
    console.log("a")
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

// MONGODB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })

    // START SERVER
    .then(() => app.listen(port, () => console.log('Server started'))
);

// TEST CONNECTION
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', function () { console.log('Connected to MongoDB') });

