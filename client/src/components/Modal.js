import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import leadIcon from '../icons/lead.svg';
import notesIcon from '../icons/notes.svg';

import Instrument from './Instrument';

import axios from 'axios';

const Form = ({code, setSongs, song}) => {

    const [open, setOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [ampSetting, setAmpSetting] = useState('');
    const [instrumentSetting, setInstrumentSetting] = useState('');

    const typeOptions = ['Rhythm', 'Lead', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Wind'];

    const onSubmit = async () => {
        if (name === '' || type === '') return;

        let ampSettingName = 'false'; let instrumentSettingName = 'false';
        if (ampSetting) ampSettingName = ampSetting.name; if (instrumentSetting) instrumentSettingName = instrumentSetting.name;

        const submitData = {
            name: name,
            type: type,
            ampSetting: ampSettingName,
            instrumentSetting: instrumentSettingName
        }

        try {
            const res = await axios.post(`/api/${code}/${song._id}/addInstrument`, submitData);

            setSongs(res.data);
            setOpen(false);

            if (ampSettingName !== 'false') {
                let song = res.data.find(song => song._id);
                let instrument = song.instruments.find(instrument => instrument._id === song.instruments[song.instruments.length - 1]._id);

                const formData = new FormData();

                formData.append('file', ampSetting);

                axios.post(`/api/${code}/${song._id}/${instrument._id}/addAmpSetting`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (instrumentSettingName !== 'false') {
                let song = res.data.find(song => song._id);
                let instrument = song.instruments.find(instrument => instrument._id === song.instruments[song.instruments.length - 1]._id);

                const formData = new FormData();

                formData.append('file', instrumentSetting);

                axios.post(`/api/${code}/${song._id}/${instrument._id}/addInstrumentSetting`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            setName(''); setType(''); setAmpSetting(''); setInstrumentSetting('');

            document.getElementById('amp-setting').value = '';
            document.getElementById('instrument-setting').value = '';
        } catch (err) {
            console.error(err);
        }
    };   

    return(
        <>
            <button className="add-instrument" onClick={() => setOpen(!open)}>
                + Add Instrument
            </button>

            <div className = "add-instrument-form">
                <div className={open ? 'open' : 'closed'}>

                    <div className = "form-name">
                        <label>Name</label>
                        <input type="text" value={name} placeholder="Name" onChange={e => setName(e.target.value)} />
                    </div>

                    <div className = "form-type">
                        <label>Instrument</label>
                        <select className = "type" type="text" placeholder="Instrument" value={type} style={{color: 'grey'}}
                            onChange={
                                e => {
                                    setType(e.target.value)
                                    if (e.target.value === '') {e.target.style.color = 'grey'}
                                    else e.target.style.color = 'black';
                                }}
                        >
                            <option value="">Select Instrument</option>
                            {typeOptions.map(
                                option => <option key={option} value={option}>{option}</option>
                            )}
                        </select>
                    </div>

                    <div className = "form-amp">
                        <label>Amp Setting</label>
                        <input id='amp-setting' type="file" onChange={event => setAmpSetting(event.target.files[0])}/>
                    </div>

                    <div className = "form-instrument">
                        <label>Instrument Setting</label>
                        <input id = 'instrument-setting' type="file" onChange={event => setInstrumentSetting(event.target.files[0])}/>
                    </div>


                    <button type="button" onClick={() => onSubmit()}>Add instrument</button>
                </div>
            </div>
        </>
    )
}

const Modal = ({code, song, setSongs, open, setOpen}) => {

    useEffect(() => {

        let handler = (e) => {
            
            if (e.target.id === 'overlay') setOpen(false);
            else return;
        }

        document.addEventListener('click', handler);

        return () => {
            document.removeEventListener('click', handler);
        }

    });

    if (!open) return null;

    return ReactDom.createPortal(
        <>
            <div id='overlay' className='overlay'>
                <div className='modal'>
                    <div className='modal-header'>
                        <h2>{song.name}</h2>
                        <button onClick={() => setOpen(false)}>X</button>
                    </div>

                    <div className='modal-navigation'>
                        <button><img src={leadIcon} alt='lead' /></button>
                        <button><img src={notesIcon} alt='notes'/></button>
                        <button><img src={notesIcon} alt='notes'/></button>
                    </div>

                    <div className='modal-body'>
                        {song.instruments.map((instrument) => (
                            <Instrument key={instrument._id} code={code} song={song} setSongs={setSongs} instrument={instrument} />
                        ))}
                    </div>

                    <div className="instrument-footer">
                        <Form code={code} setSongs={setSongs} song={song}/>
                    </div>

                </div>
            </div>
        </>,
        document.getElementById('modal')
    )
}

export default Modal;