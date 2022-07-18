import React, {useEffect, useState, useRef} from 'react'
import Modal from './Modal';

import axios from 'axios';

const Song = ({code, song, setSongs}) => {

    const [open, setOpen] = useState(false);
    const [name, setName] = useState(song.name);

    const songRef = useRef(null);

    const onOpen = (event) => {
        if (event.target.className === 'song-menu') return;
        else if (event.target.className === 'show-song') setOpen(!open);
    }
    
    const editName = async () => {
        try {
            const res = await axios.patch(`/api/${code}/${song._id}/editSong`, {name: name});
            setSongs(res.data);

        } catch (err) {
            return;
        }
    }

    const checkAutoFocus = () => {
        if (name === "") return true;
    }
    
    return (
        <div key={song._id} className="song-container">

        <div className="show-song" onClick={(e) => onOpen(e)}>

            <button className="song">
                <input value={name} autoFocus={checkAutoFocus()} ref={songRef}
                    onChange={(e) => setName(e.target.value)}
                    onBlur = {() => editName()}
                />
            </button>
            <Menu code={code} song={song} songRef={songRef} setSongs={setSongs}/>
        </div>

        { open === true ? (
            <Modal code={code} song={song} setSongs={setSongs} open={open} setOpen={setOpen}/>
        ):(
            null
        )}

    </div>
    )
}

const Menu = ({code, song, songRef, setSongs}) => {

    const [open, setOpen] = useState(false);

    useEffect(() => {

        let handler = (e) => {
            if (e.target.id === `song-menu-${song._id}`) return
            else if (e.target.id !== song._id) setOpen(false)
        }

        document.addEventListener('click', handler);

        return () => {
            document.removeEventListener('click', handler);
        }

    });

    const onDelete = async () => {
        try {
            const res = await axios.delete(`/api/${code}/${song._id}/deleteSong`);
            setSongs(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return(
        <>
            <button id={`song-menu-${song._id}`} className="song-menu" onClick={() => setOpen(!open)}>...</button>

            <div id = {song._id} className={`song-menu-container-${open ? 'open' : 'closed'}`}>
                <button className="song-menu-item" onClick={() => songRef.current.focus()}>Edit</button>
                <button type="button" className="song-menu-item" onClick={() => onDelete()}>Delete</button>
            </div>
        </>
    )
}

export default Song;