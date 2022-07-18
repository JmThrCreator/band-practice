// REQUIRE
const express = require('express');
const fs = require('fs');
const Board = require('../models/board')

// EXPRESS
const router = express.Router();


// GET board
router.get('/:code/board', async (req, res) => {
    try {
        const board = await Board.findOne({code:req.params.code}).exec();

        if (board === null) return res.status(400).json({ message: "board does not exist" });
        else return res.json("valid")
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST board
router.post('/addBoard', async (req, res) => {
    try {
        const { code, email } = req.body;

        const validEmail = await Board.findOne({email:email}).exec();

        if (validEmail !== null) return res.status(400).json({ message: "email already in use" });

        const board = new Board({
            code,
            email
        });

        const newBoard = await board.save();

        if (!fs.existsSync(`./uploads/${newBoard.code}`)) fs.mkdirSync(`./uploads/${newBoard.code}`);

        res.json("valid")
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// GET songs
router.get('/:code/songs', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        if (!board) return res.status(400).json({ message: "code not found" });
        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST song
router.post('/:code/addSong', async (req, res) => {
    try {
        const { name, group } = req.body;

        const board = await Board.findOne({ code: req.params.code });

        if (req.body.hasOwnProperty('instruments')) {
            console.log("a")
            board.songs.push({
                name: name,
                group: group,
                instruments: req.body.instruments
            });
        }

        else {
            board.songs.push({
                name: name,
                group: group
            });
        }

        await board.save();
        const songs = board.songs;

        const song = board.songs.at(-1)


        if (!fs.existsSync(`./uploads/${board.code}/${song._id}`)) fs.mkdirSync(`./uploads/${board.code}/${song._id}`);

        

        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE song
router.patch('/:code/:song/editSong', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )

        if (req.body.name) {
            song.name = req.body.name
        }
        else if (req.body.group) {
            song.group = req.body.group
        }

        await board.save();
        res.json(board.songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE song
router.delete('/:code/:song/deleteSong', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )

        song.remove();

        if (fs.existsSync(`./uploads/${board.code}/${song._id}`)) fs.rmdirSync(`./uploads/${board.code}/${song._id}`, { recursive: true });
        
        await board.save();

        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// POST instrument
router.post('/:code/:song/addInstrument', async (req, res) => {
    try {
        const { name, type, image } = req.body;
        const progress = 0;

        const board = await Board.findOne({ code: req.params.code })

        board.songs.id( req.params.song ).instruments.push ({
            name,
            type,
            progress,
            image
        });

        await board.save();
        res.json(board.songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE instrument 
router.patch('/:code/:song/:instrument/editInstrument', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);
        
        if (req.body.hasOwnProperty('name')) instrument.name = req.body.name;
        if (req.body.hasOwnProperty('type')) instrument.type = req.body.type;
        if (req.body.hasOwnProperty('progress')) instrument.progress = req.body.progress;
        if (req.body.hasOwnProperty('image')) instrument.image = req.body.image;

        await board.save();
        res.json(board.songs);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE instrument
router.delete('/:code/:song/:instrument/deleteInstrument', async (req, res) => {
    try {

        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);

        instrument.remove();

        fileExtension = instrument.image.split('.').pop();

        if (fs.existsSync(`./uploads/${board.code}/${song._id}/${instrument._id}-image.${fileExtension}`)) {
            fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-image.${fileExtension}`, err => {
                if (err) return res.status(500).send(err);
            });
        }

        await board.save();

        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// POST image to server
router.post('/:code/:song/:instrument/addImage', async (req, res) => {
    try{
        const board = await Board.findOne({ code: req.params.code })

        if (req.files === null) return res.status(400).json({ message: 'No file uploaded' });

        const file = req.files.file;

        const fileExtension = file.name.split('.').pop();
        if (!['jpeg', 'jpg', 'png', 'heic'].includes(fileExtension.toLowerCase())) return res.status(400).json({ mesage: 'File type not supported' });

        file.mv(`./uploads/${board.code}/${req.params.song}/${req.params.instrument}-image.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'File uploaded' });
        })
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE image from server
router.delete('/:code/:song/:instrument/deleteImage', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);

        const fileExtension = instrument.image.split('.').pop();

        fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-image.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
        });

        instrument.image = 'false';
        
        await board.save();

        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;