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

        board.songs.push({
            name: name,
            group: group
        });

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
        const { name, type, ampSetting, instrumentSetting } = req.body;
        const progress = 0;

        const board = await Board.findOne({ code: req.params.code })

        console.log(instrumentSetting)

        board.songs.id( req.params.song ).instruments.push ({
            name,
            type,
            progress,
            ampSetting,
            instrumentSetting
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
        const { name, type, ampSetting, instrumentSetting } = req.body;

        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);
        
        if (name) instrument.name = name;
        if (type) instrument.type = type;
        if (ampSetting) instrument.ampSetting = ampSetting;
        if (instrumentSetting) instrument.instrumentSetting = instrumentSetting;

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

        fileExtension = instrument.ampSetting.split('.').pop();
        if (fs.existsSync(`./uploads/${board.code}/${req.params.song}/${req.params.instrument}-ampSetting.${fileExtension}`)) {
            fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-ampSetting.${fileExtension}`, err => {
                if (err) return res.status(500).send(err);
            });
        }

        fileExtension = instrument.instrumentSetting.split('.').pop();
        if (fs.existsSync(`./uploads/${board.code}/${req.params.song}/${req.params.instrument}-instrumentSetting.${fileExtension}`)) {
            fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`, err => {
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



// UPDATE progress
router.patch('/:code/:song/:instrument/editProgress', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);

        instrument.progress = req.body.progress;

        await board.save();
        res.json(board.songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// POST ampSetting to instrument
router.post('/:code/:song/:instrument/addAmpSetting', async (req, res) => {
    try{
        const board = await Board.findOne({ code: req.params.code })

        if (req.files === null) return res.status(400).json({ message: 'No file uploaded' });

        const file = req.files.file;

        const fileExtension = file.name.split('.').pop();
        if (!['jpeg', 'jpg', 'png', 'heic'].includes(fileExtension.toLowerCase())) return res.status(400).json({ mesage: 'File type not supported' });

        file.mv(`./uploads/${board.code}/${req.params.song}/${req.params.instrument}-ampSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'File uploaded' });
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST instrumentSetting to instrument
router.post('/:code/:song/:instrument/addInstrumentSetting', async (req, res) => {
    try{
        const board = await Board.findOne({ code: req.params.code })

        if (req.files === null) return res.status(400).json({ message: 'No file uploaded' });

        const file = req.files.file;

        const fileExtension = file.name.split('.').pop();
        if (!['jpeg', 'jpg', 'png', 'heic'].includes(fileExtension.toLowerCase())) return res.status(400).json({ mesage: 'File type not supported' });

        file.mv(`./uploads/${board.code}/${req.params.song}/${req.params.instrument}-instrumentSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'File uploaded' });
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// DELETE ampSetting
router.delete('/:code/:song/:instrument/deleteAmpSetting', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);

        const fileExtension = instrument.ampSetting.split('.').pop();

        fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-ampSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
        });

        instrument.ampSetting = 'false';
        
        await board.save();

        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE instrumentSetting
router.delete('/:code/:song/:instrument/deleteInstrumentSetting', async (req, res) => {
    try {
        const board = await Board.findOne({ code: req.params.code })
        const song = await board.songs.id( req.params.song )
        const instrument = song.instruments.id(req.params.instrument);

        const fileExtension = instrument.instrumentSetting.split('.').pop();

        fs.unlinkSync(`./uploads/${board.code}/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
        });

        instrument.instrumentSetting = 'false';
        
        await board.save();

        const songs = board.songs;
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;