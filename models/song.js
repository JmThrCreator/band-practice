// REQUIRE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SCHEMA
const songSchema = new Schema({

    // MAIN
    name: { 
        type: String, 
        required: true
    },
    group: {
        type: String,
        required: true
    },

    // INSTRUMENTS
    instruments: [
        {
            name: {
                type: String
            },
            type: {
                type: String
            },
            progress: {
                type: Number
            },
            ampSetting: {
                type: String
            },
            instrumentSetting: {
                type: String
            }
        }
    ],

    // NOTES
    notes: {
        type: String
    },

    // LINKS
    links: [
        {
            name :{
                type: String
            },
            url: {
                type: String
            }
        }
    ]
});

module.exports = mongoose.model('Song', songSchema);