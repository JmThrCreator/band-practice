// REQUIRE
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// SCHEMA
const boardSchema = new Schema({

    code: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    songs: [{

        // MAIN
        name: { 
            type: String, 
            required: false
        },
        group: {
            type: String,
            required: false
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
        
    }]
})

module.exports = mongoose.model('Board', boardSchema);