import React, {useEffect, useState} from 'react'
import { useDrop } from 'react-beautiful-dnd'
import Modal from './Modal';

import axios from 'axios';

import editIcon from '../icons/edit.svg';

const Song = ({song, setSongs, group, songs}) => {

    const [edit, setEdit] = useState(false);
    const [open, setOpen] = useState(false);

    const onOpen = (event) => {
        // log all elements that have been clicked
        if (event.target.className === 'song-menu') return;
        else if (event.target.className === 'show-song') setOpen(!open);
    }
    
    return (
        <div key={song._id} className="song-container">

        { edit === false ? (
            <div className="show-song" onClick={(e) => onOpen(e)}>
                <button key={song._id} className="song">
                    {song.name} 
                </button>
                <Menu group={group} song={song} setEdit={setEdit} setSongs={setSongs}/>
            </div>
        ):(
            <div className="song-edit">
                <Edit song={song} setSongs={setSongs} group={group} setEdit={setEdit} songs={songs}/>
            </div>
        )}

        { open === true ? (
            <Modal song={song} setSongs={setSongs} open={open} setOpen={setOpen}/>
        ):(
            null
        )}

    </div>
    )
}

const Menu = ({group, song, setEdit, setSongs}) => {

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
            const res = await axios.delete(`/api/${group.name}/${song._id}/deleteSong`);
            setSongs(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return(
        <>
            <button id={`song-menu-${song._id}`} className="song-menu" onClick={() => setOpen(!open)}>...</button>

            <div id = {song._id} className={`song-menu-container-${open ? 'open' : 'closed'}`}>
                <button className="song-menu-item" onClick={() => setEdit(true)}>Edit</button>
                <button type="button" className="song-menu-item" onClick={() => onDelete()}>Delete</button>
            </div>
        </>
    )
}

const Edit = ({song, setSongs, group, setEdit, songs}) => {
    
    const [name, setName] = useState(song.name);

    const onSubmit = async () => {
        if (name === song.name) {
            setEdit(false);
        }
        else if (name.length > 0) {
            try {
                const res = await axios.patch(`/api/${group.name}/${song._id}/editSong`, {name: name});
                setSongs(res.data);
            } catch (err) {
                console.log(err);
            }
        }
    }

    return(
        <div className="edit-song">
            <form>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <button type="button" onClick={() => onSubmit()}><img src={editIcon} alt="edit"/></button>
            </form>
        </div>
    )
}

export default Song;