// REQUIRE
const express = require('express');
const fs = require('fs');
const Song = require('../models/song');

// EXPRESS
const router = express.Router();

// GET all songs
router.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all songs in group
router.get('/:group/songs', async (req, res) => {
    try {
        const songs = await Song.find({ group: req.params.group });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST song to group
router.post('/:group/addSong', async (req, res) => {
    try {
        const { name } = req.body;
        const song = new Song({
            name,
            group: req.params.group
        });
        await song.save();
        if (!fs.existsSync(`./uplaods/${req.params.song}`)) fs.mkdirSync(`./uploads/${song._id}`);
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST instrument
router.post('/:song/addInstrument', async (req, res) => {
    try {
        const { name, type, ampSetting, instrumentSetting } = req.body;
        const progress = 0;
        const song = await Song.findById(req.params.song);
        song.instruments.push({
            name,
            type,
            progress,
            ampSetting,
            instrumentSetting
        });
        await song.save();
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST ampSetting to instrument
router.post('/:song/:instrument/addAmpSetting', async (req, res) => {
    try{
        if (req.files === null) return res.status(400).json({ message: 'No file uploaded' });

        const file = req.files.file;

        const fileExtension = file.name.split('.').pop();
        if (!['jpeg', 'jpg', 'png', 'heic'].includes(fileExtension.toLowerCase())) return res.status(400).json({ mesage: 'File type not supported' });

        file.mv(`./uploads/${req.params.song}/${req.params.instrument}-ampSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'File uploaded' });
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST instrumentSetting to instrument
router.post('/:song/:instrument/addInstrumentSetting', async (req, res) => {
    try{
        if (req.files === null) return res.status(400).json({ message: 'No file uploaded' });

        const file = req.files.file;

        const fileExtension = file.name.split('.').pop();
        if (!['jpeg', 'jpg', 'png', 'heic'].includes(fileExtension.toLowerCase())) return res.status(400).json({ mesage: 'File type not supported' });

        file.mv(`./uploads/${req.params.song}/${req.params.instrument}-instrumentSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'File uploaded' });
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE song in group
router.patch('/:group/:song/editSong', async (req, res) => {
    try {
        if (req.body.name) {
            await Song.findOneAndUpdate({ _id: req.params.song }, { name: req.body.name });
        }
        else if (req.body.group) {
            await Song.findOneAndUpdate({ _id: req.params.song }, { group: req.body.group });
        }
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE instrument 
router.patch('/:song/:instrument/editInstrument', async (req, res) => {
    try {
        const { name, type, ampSetting, instrumentSetting } = req.body;
        const song = await Song.findById(req.params.song);
        const instrument = song.instruments.id(req.params.instrument);
        if (name) instrument.name = name;
        if (type) instrument.type = type;
        if (ampSetting) instrument.ampSetting = ampSetting;
        if (instrumentSetting) instrument.instrumentSetting = instrumentSetting;
        await song.save();

        const songs = await Song.find();
        res.json(songs);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE progress
router.patch('/:song/:instrument/editProgress', async (req, res) => {
    try {
        const song = await Song.findById(req.params.song);
        const instrument = song.instruments.id(req.params.instrument);
        instrument.progress = req.body.progress;
        await song.save();
        
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE song from group
router.delete('/:group/:song/deleteSong', async (req, res) => {
    try {
        if (fs.existsSync(`./uploads/${req.params.song}`)) {
            fs.rmdirSync(`./uploads/${req.params.song}`, { recursive: true });
        }

        await Song.findByIdAndDelete(req.params.song);
        const songs = await Song.find();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE instrument
router.delete('/:song/:instrument/deleteInstrument', async (req, res) => {
    try {
        const song = await Song.findById(req.params.song);
        const instrument = song.instruments.id(req.params.instrument);
        instrument.remove();

        fileExtension = instrument.ampSetting.split('.').pop();
        if (fs.existsSync(`./uploads/${req.params.song}/${req.params.instrument}-ampSetting.${fileExtension}`)) {
            fs.unlinkSync(`./uploads/${song._id}/${instrument._id}-ampSetting.${fileExtension}`, err => {
                if (err) return res.status(500).send(err);
            });
        }

        fileExtension = instrument.instrumentSetting.split('.').pop();
        if (fs.existsSync(`./uploads/${req.params.song}/${req.params.instrument}-instrumentSetting.${fileExtension}`)) {
            fs.unlinkSync(`./uploads/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`, err => {
                if (err) return res.status(500).send(err);
            });
        }

        await song.save();
        const songs = await Song.find();

        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE ampSetting
router.delete('/:song/:instrument/deleteAmpSetting', async (req, res) => {
    try {
        const song = await Song.findById(req.params.song);
        const instrument = song.instruments.id(req.params.instrument);

        const fileExtension = instrument.ampSetting.split('.').pop();

        fs.unlinkSync(`./uploads/${song._id}/${instrument._id}-ampSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
        });

        instrument.ampSetting = 'false';

        await song.save();
        const songs = await Song.find();
        res.json(songs);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE instrumentSetting
router.delete('/:song/:instrument/deleteInstrumentSetting', async (req, res) => {
    try {
        const song = await Song.findById(req.params.song);
        const instrument = song.instruments.id(req.params.instrument);

        const fileExtension = instrument.instrumentSetting.split('.').pop();

        fs.unlinkSync(`./uploads/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`, err => {
            if (err) return res.status(500).send(err);
        });

        instrument.instrumentSetting = 'false';
        
        await song.save();
        const songs = await Song.find();
        res.json(songs);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;