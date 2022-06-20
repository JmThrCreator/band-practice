// ENV
require('dotenv').config();

// REQUIRE
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

// EXPRESS
const app = express();

app.use(fileUpload());
app.use(express.json());

// ROUTES
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// MONGODB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => app.listen(8080, () => console.log('Server started'))
);

// TEST CONNECTION
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', function () { console.log('Connected to MongoDB') });

