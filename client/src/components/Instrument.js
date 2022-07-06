import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import leadIcon from '../icons/lead.svg';
import drumsIcon from '../icons/drums.svg';
import bassIcon from '../icons/bass.svg'
import rhythmIcon from '../icons/rhythm.svg'
import keyboardIcon from '../icons/keyboard.svg'
import vocalsIcon from '../icons/vocals.svg'
import windIcon from '../icons/wind.svg'

import ampIcon from '../icons/amp.svg';
import dialIcon from '../icons/dials.svg';
import editIcon from '../icons/edit.svg';

import axios from 'axios';

const Menu = ({code, song, setSongs, instrument, setEdit}) => {

    const [open, setOpen] = useState(false);

    useEffect(() => {

        let handler = (e) => {
            if (e.target.id === `instrument-menu-${instrument._id}`) return
            else if (e.target.id !== instrument._id) setOpen(false)
        }

        document.addEventListener('click', handler);

        return () => {
            document.removeEventListener('click', handler);
        }

    });

    const onDelete = async () => {
        try {
            const res = await axios.delete(`/api/${code}/${song._id}/${instrument._id}/deleteInstrument`);
            setSongs(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return(
        <>
            <button id={`instrument-menu-${instrument._id}`} className="instrument-menu" onClick={() => setOpen(!open)}>...</button>

            <div id = {instrument._id} className={`instrument-menu-container-${open ? 'open' : 'closed'}`}>
                <button className="instrument-menu-item" onClick={() => setEdit(true)}>Edit</button>
                <button className="instrument-menu-item" type="button" onClick={() => onDelete()}>Delete</button>
            </div>
        </>
    )
}

const Edit = ({code, song, setSongs, instrument, setEdit}) => {

    const [name, setName] = useState(instrument.name);
    const [type, setType] = useState(instrument.type);
    const [ampSetting, setAmpSetting] = useState(instrument.ampSetting);
    const [instrumentSetting, setInstrumentSetting] = useState(instrument.instrumentSetting);
    const [deleteAmpSetting, setDeleteAmpSetting] = useState(false);
    const [deleteInstrumentSetting, setDeleteInstrumentSetting] = useState(false);

    const typeOptions = ['Rhythm', 'Lead', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Wind'];

    const onDeleteSetting = async (setting) => {
        if (setting !== 'Amp' && setting !== 'Instrument') return;
        else if (setting === 'Amp' && instrument.ampSetting === 'false') return;
        else if (setting === 'Instrument' && instrument.instrumentSetting === 'false') return;

        try {
            const res = await axios.delete(`/api/${code}/${song._id}/${instrument._id}/delete${setting}Setting`);
            setSongs(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    const onSubmit = async () => {
        if (name === '' || type === '') return;
        else if (name.length > 0) {

            let ampSettingBool = 'false'; let instrumentSettingBool = 'false';

            if (ampSetting && ampSetting !== 'false' && ampSetting !== 'delete') ampSettingBool = ampSetting.name;
            if (instrumentSetting && instrumentSetting !== 'false' && instrumentSetting !== 'delete') instrumentSettingBool = instrumentSetting.name; 

            const submitData = {
                name: name,
                type: type,
                ampSetting: ampSettingBool,
                instrumentSetting: instrumentSettingBool,
            }

            try {
                if (deleteAmpSetting) onDeleteSetting('Amp');
                if (deleteInstrumentSetting) onDeleteSetting('Instrument');

                const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, submitData);
                setSongs(res.data);
                setEdit(false);

                try {
                    if (ampSetting.name.split('.')[0] === instrument.ampSetting) ampSettingBool = 'false'
                } catch (err) { ampSettingBool = 'false' }

                try {
                    if (instrumentSetting.name.split('.')[0] === instrument.instrumentSetting) instrumentSettingBool = 'false'
                } catch (err) { instrumentSettingBool = 'false' }

                if (ampSettingBool !== 'false' && ampSetting !== 'delete') {

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
    
                if (instrumentSettingBool !== 'false' && instrumentSetting !== 'delete') {

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

                setName(''); setType(''); setAmpSetting(''); setInstrumentSetting(''); setDeleteAmpSetting(false); setDeleteInstrumentSetting(false);
            } catch (err) {
                console.log(err);
            }
        }
    }



    return(
        <div className="edit-instrument">
            <form>
                <div className = "form-name">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className = "form-type">         
                    <select className = "type" type="text" placeholder="Instrument" value={type}
                        onChange={
                            e => {
                                setType(e.target.value);
                        }}
                    >
                        <option value={instrument.type}>{instrument.type}</option>
                        {typeOptions.map(
                            option => <option key={option} value={option}>{option}</option>
                        )}
                    </select>
                </div>

                {ampSetting !== 'false' && ampSetting !== 'delete' ? (
                    <div className = "form-amp">
                        <label>Amp Setting</label>
                        <button className="delete-amp-setting" type='button' onClick={() => {setDeleteAmpSetting(true); setAmpSetting('delete')}}>Delete file</button>
                    </div>
                ) : ( 
                    <div className = "form-amp">
                        <label>Amp Setting</label>
                        <input id='amp-setting' type="file" onChange={event => setAmpSetting(event.target.files[0])}/>
                    </div>
                )}

                { instrumentSetting !== 'false' && instrumentSetting !== 'delete' ? (
                    <div className = "form-instrument">
                        <label>Inst. Setting</label>
                        <button id='delete-instrument-setting' type='button' onClick={() => {setDeleteInstrumentSetting(true); setInstrumentSetting('delete')}}>Delete file</button>
                    </div>
                ) : (
                    <div className = "form-instrument">
                        <label>Inst. Setting</label>
                        <input id='instrument-setting' type="file" onChange={event => setInstrumentSetting(event.target.files[0])}/>
                    </div>
                )}



                <button className = "edit-submit" type="button" onClick={() => onSubmit()}><img src={editIcon} alt="edit"/></button>
            </form>
        </div>
    )
}

const DisplaySetting = ({code, song, instrument, displaySetting, setDisplaySetting}) => {

    const getImage = () => {
        if (displaySetting === 'amp') {
            let fileExtension = instrument.ampSetting.split('.').pop();
            return `http://127.0.0.1:8080/uploads/${code}/${song._id}/${instrument._id}-ampSetting.${fileExtension}`
        }
        else if (displaySetting === 'instrument') {
            let fileExtension = instrument.instrumentSetting.split('.').pop();
            return `http://127.0.0.1:8080/uploads/${code}/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`
        }
    }

    return ReactDom.createPortal(
        <div className="setting-container">
            <button className="close-setting" onClick={() => setDisplaySetting('')}>X</button>
            <img src={getImage()} alt="setting"/>
        </div>,
        document.getElementById('image')
    );
}

const Instrument = ({code, song, setSongs, instrument}) => {

    const instrumentImageMap = {'Lead': leadIcon, 'Drums': drumsIcon, 'Bass': bassIcon, 'Rhythm': rhythmIcon, 'Keyboard': keyboardIcon, 'Vocals': vocalsIcon, 'Wind': windIcon};
    const [edit, setEdit] = useState(false);
    const [displaySetting, setDisplaySetting] = useState('');
    const [progress, setProgress] = useState(instrument.progress);

    const onOpenAmpSetting = () => {
        if (instrument.ampSetting === 'false') return;
        else if (displaySetting !== '') return;

        setDisplaySetting('amp');
    }

    const onOpenInstrumentSetting = () => {
        if (instrument.instrumentSetting === 'false') return;
        else if (displaySetting !== '') return;

        setDisplaySetting('instrument');
    }

    const editProgess = async () => {
        try {
            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editProgress`, {progress: progress});
            setSongs(res.data);

        } catch (err) {
            console.log(err);
        }
    }

    const getProgressColor = (value) => {
        let color = '#7ec973'

        if (value < 30) color = '#ffa996'
        else if (value < 65) color = '#ffcc96'

        return color;
    }

    const [progressStyle, setProgressStyle] = useState({ background: `linear-gradient(to right, ${getProgressColor(progress)} ${instrument.progress}%, #d1d1d1 ${instrument.progress}%)` });

    return (
        <div className="instrument-container">

        { edit === false ? (
            <div className="show-instrument">
                <img className="instrument-icon" src={instrumentImageMap[instrument.type]} alt={instrument.type}/>
                <h5>{instrument.name}</h5>

                <input className="progress-slider" defaultValue={instrument.progress} id={`progress-slider-${instrument._id}`} type="range" min="0" max="100" style={progressStyle}
                    onChange={e => {
                        let slider = e.target;
                        let value = slider.value;
                        let color = getProgressColor(value);

                        let style = {background: `linear-gradient(to right, ${color} ${slider.value}%, #d1d1d1 ${slider.value}%)`}
                        setProgressStyle(style);   
                        setProgress(value);
                    }}
                    onMouseUp={() => editProgess()}
                    onTouchEnd={() => editProgess()}
                />

                { instrument.ampSetting !== 'false' ? (
                    <button className="amp-setting"><img src={ampIcon} alt="amp-setting" onClick={() => onOpenAmpSetting()}></img></button>
                ) : ( <img className="amp-setting" style={{opacity:0}} src={ampIcon} alt="amp-setting"/> )}

                { instrument.instrumentSetting !== 'false' ? (
                <button className="instrument-setting"><img  src={dialIcon} alt="instrument-setting" onClick={() => onOpenInstrumentSetting()}/></button>
                ) : ( <img className="instrument-setting" style={{opacity:0}} src={dialIcon} alt="instrument-setting"/> )}

                <Menu code={code} song={song} setSongs={setSongs} instrument={instrument} setEdit={setEdit}/>
            </div>
        ) : (
            <Edit code={code} song={song} setSongs={setSongs} instrument={instrument} setEdit={setEdit}/>
        )}

        { displaySetting !== '' ? (
            <DisplaySetting code={code} song={song} instrument={instrument} displaySetting={displaySetting} setDisplaySetting={setDisplaySetting}/>
        ) : (
            null
        )}

        </div>
    )
}

export default Instrument;