import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import leadIcon from '../icons/lead.svg';
import drumsIcon from '../icons/drums.svg';
import ampIcon from '../icons/amp.svg';
import editIcon from '../icons/edit.svg';

import axios from 'axios';

const Menu = ({song, setSongs, instrument, setEdit}) => {

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
            const res = await axios.delete(`/api/${song._id}/${instrument._id}/deleteInstrument`);
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

const Edit = ({song, setSongs, instrument, setEdit}) => {

    const [name, setName] = useState(instrument.name);
    const [type, setType] = useState(instrument.type);
    const [ampSetting, setAmpSetting] = useState(instrument.ampSetting);
    const [instrumentSetting, setInstrumentSetting] = useState(instrument.instrumentSetting);

    const typeOptions = ['Rhythm', 'Lead', 'Bass', 'Drums', 'Keyboard', 'Vocals'];

    const onSubmit = async () => {
        if (name === '' || type === '') return;
        else if (name.length > 0) {

            let ampSettingBool = 'false'; let instrumentSettingBool = 'false';
            if (ampSetting && ampSetting !== 'false') ampSettingBool = ampSetting.name; 
            if (instrumentSetting && instrumentSetting !== 'false') instrumentSettingBool = instrumentSetting.name;

            console.log(ampSettingBool, instrumentSetting);

            const submitData = {
                name: name,
                type: type,
                ampSetting: ampSettingBool,
                instrumentSetting: instrumentSettingBool,
            }

            try {
                const res = await axios.patch(`/api/${song._id}/${instrument._id}/editInstrument`, submitData);
                setSongs(res.data);
                setEdit(false);

                if (ampSettingBool !== 'false') {
                    let song = res.data.find(song => song._id === song._id);
                    let instrument = song.instruments.find(instrument => instrument._id === song.instruments[song.instruments.length - 1]._id);
    
                    const formData = new FormData();
    
                    formData.append('file', ampSetting);
    
                    axios.post(`/api/${song._id}/${instrument._id}/addAmpSetting`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
    
                if (instrumentSettingBool !== 'false') {
                    let song = res.data.find(song => song._id === song._id);
                    let instrument = song.instruments.find(instrument => instrument._id === song.instruments[song.instruments.length - 1]._id);
    
                    const formData = new FormData();
    
                    formData.append('file', instrumentSetting);
    
                    axios.post(`/api/${song._id}/${instrument._id}/addInstrumentSetting`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }

                setName(''); setType(''); setAmpSetting(''); setInstrumentSetting('');
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

                <div className = "form-amp">
                    <label>Amp Setting</label>
                    <input id='amp-setting' type="file" onChange={event => setAmpSetting(event.target.files[0])}/>
                </div>

                <div className = "form-instrument">
                    <label>Inst. Setting</label>
                    <input id = 'instrument-setting' type="file" onChange={event => setInstrumentSetting(event.target.files[0])}/>
                </div>

                <button type="button" onClick={() => onSubmit()}><img src={editIcon} alt="edit"/></button>
            </form>
        </div>
    )
}

const DisplaySetting = ({song, instrument, displaySetting, setDisplaySetting}) => {

    const getImage = () => {
        if (displaySetting === 'amp') {
            let fileExtension = instrument.ampSetting.split('.').pop();
            return `http://127.0.0.1:8080/uploads/${song._id}/${instrument._id}-ampSetting.${fileExtension}`
        }
        else if (displaySetting === 'instrument') {
            let fileExtension = instrument.ampSetting.split('.').pop();
            return `http://127.0.0.1:8080/uploads/${song._id}/${instrument._id}-instrumentSetting.${fileExtension}`
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

const Instrument = ({song, setSongs, instrument}) => {

    const instrumentImageMap = {'Lead': leadIcon, 'Drums': drumsIcon};
    const [edit, setEdit] = useState(false);
    const [displaySetting, setDisplaySetting] = useState('');

    const onOpenAmpSetting = () => {
        if (instrument.ampSetting === 'false') return;
        else if (displaySetting !== '') return;

        setDisplaySetting('amp');
    }

    return (
        <div className="instrument-container">

        { edit === false ? (
            <div className="show-instrument">
                <img className="instrument-icon" src={instrumentImageMap[instrument.type]} alt={instrument.type}/>
                <h5>{instrument.name}</h5>
                <input className="progress-slider" defaultValue={instrument.progress} id={`progress-slider-${instrument._id}`} type="range" min="0" max="100" style={{background: `linear-gradient(to right, #7ec973 ${instrument.progress}%, #d1d1d1 ${instrument.progress}%)`}}
                    onChange={e => {
                        let slider = e.target;
                        let style = `linear-gradient(to right, #7ec973 ${slider.value}%, #d1d1d1 ${slider.value}%)`
                        slider.style.background = style;
                    }}
                />

                { instrument.ampSetting !== 'false' ? (
                    <button className="amp-setting"><img src={ampIcon} alt="amp-setting" onClick={() => onOpenAmpSetting()}></img></button>
                ) : ( <img className="amp-setting" style={{opacity:0}} src={ampIcon} alt="amp-setting"/> )}

                { instrument.instrumentSetting !== 'false' ? (
                <button className="instrument-setting"><img  src={ampIcon} alt="instrument-setting"/></button>
                ) : ( <img className="instrument-setting" style={{opacity:0}} src={ampIcon} alt="instrument-setting"/> )}

                <Menu song={song} setSongs={setSongs} instrument={instrument} setEdit={setEdit}/>
            </div>
        ) : (
            <Edit song={song} setSongs={setSongs} instrument={instrument} setEdit={setEdit}/>
        )}

        { displaySetting !== '' ? (
            <DisplaySetting song={song} instrument={instrument} displaySetting={displaySetting} setDisplaySetting={setDisplaySetting}/>
        ) : (
            null
        )}

        </div>
    )
}

export default Instrument;