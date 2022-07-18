import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import leadIcon from '../icons/lead.svg';
import drumsIcon from '../icons/drums.svg';
import bassIcon from '../icons/bass.svg'
import rhythmIcon from '../icons/rhythm.svg'
import keyboardIcon from '../icons/keyboard.svg'
import vocalsIcon from '../icons/vocals.svg'
import windIcon from '../icons/wind.svg'

import closeIcon from '../icons/close.svg'
import imageOffIcon from '../icons/image off.svg';
import imageOnIcon from '../icons/image on.svg';
import selectIcon from '../icons/select.svg';

import axios from 'axios';

const Menu = ({code, song, setSongs, instrument, image}) => {

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
            return;
        }
    };

    const onEditImage = async (newImage) => {

        if (!newImage) return;

        else if (image && image !== "false") {
            axios.delete(`/api/${code}/${song._id}/${instrument._id}/deleteImage`);
        }

        const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {image: newImage.name});
    
        setSongs(res.data);

        const formData = new FormData();
        formData.append('file', newImage);

        axios.post(`/api/${code}/${song._id}/${instrument._id}/addImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    const onDeleteImage = async () => {
        try {
            if (!image || image === "false") return;

            axios.delete(`/api/${code}/${song._id}/${instrument._id}/deleteImage`);

            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {image: 'false'});
            setSongs(res.data);

        } catch (err) {
            return;
        }
    }

    return(
        <>
            <button id={`instrument-menu-${instrument._id}`} className="instrument-menu" onClick={() => setOpen(!open)}>...</button>
            
            <div id = {instrument._id} className={`instrument-menu-container-${open ? 'open' : 'closed'}`}>

                <button className="instrument-menu-item">
                    <div className="edit-image"><input type="file"
                        onChange={
                        event => {
                            onEditImage(event.target.files[0])
                        }
                        }/>
                    </div>
                    Edit image
                </button>
                
                <button className="instrument-menu-item" onClick={() => onDeleteImage()}>Remove image</button>
                <hr/>
                <button className="instrument-menu-item" type="button" onClick={() => onDelete()}>Delete instrument</button>
            </div>
        </>
    )
}

const Type = ({code, song, setSongs, instrument}) => {

    const instrumentImageMap = {'Select': selectIcon, 'Lead': leadIcon, 'Drums': drumsIcon, 'Bass': bassIcon, 'Rhythm': rhythmIcon, 'Keyboard': keyboardIcon, 'Vocals': vocalsIcon, 'Wind': windIcon};
    const typeOptions = ['Rhythm', 'Lead', 'Bass', 'Drums', 'Keyboard', 'Vocals', 'Wind'];

    const onEdit = async (type) => {
        try {
            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {type: type});
            setSongs(res.data);

        } catch (err) {
            return;
        }
    }

    return (
        <>
            <img className="instrument-icon" src={instrumentImageMap[instrument.type]} alt={instrument.type}/>
            <div className="select-type">
                <select placeholder="Select" value={instrument.type}
                    onChange={
                        e => {
                            onEdit(e.target.value);
                    }}
                >
                    {typeOptions.map(
                        option => <option key={option} value={option}>{option}</option>
                    )}
                </select>
            </div>
        </>
    )

}

const DisplayImage = ({code, song, instrument, setDisplayImage}) => {

    useEffect(() => {

        let handler = (e) => {
            
            if (e.target.id === 'image-overlay') setDisplayImage(false);
            else return;
        }

        document.addEventListener('click', handler);

        return () => {
            document.removeEventListener('click', handler);
        }

    });

    const getImage = () => {
        let fileExtension = instrument.image.split('.').pop();
        return `/uploads/${code}/${song._id}/${instrument._id}-image.${fileExtension}`
    }
    
    return ReactDom.createPortal(

        <div id='image-overlay' className='image-overlay'>
            <div className="image-container">
                <button className="close-image" onClick={() => setDisplayImage(false)}><img src={closeIcon} alt="close"/></button>
                <img className="image" src={getImage()} alt="image"/>
            </div>
        </div>,
        document.getElementById('image')
    );
}

const Instrument = ({code, song, setSongs, instrument}) => {

    const [displayImage, setDisplayImage] = useState(false);
    const [progress, setProgress] = useState(instrument.progress);

    const [name, setName] = useState(instrument.name);

    const onOpenImage = () => {
        setDisplayImage(true);
    }

    const editName = async () => {
        try {
            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {name: name});
            setSongs(res.data);

        } catch (err) {
            return;
        }
    }

    const editProgess = async () => {
        try {
            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {progress: progress});
            setSongs(res.data);

        } catch (err) {
            return;
        }
    }

    const onAddImage = async (newImage) => {

        if (!newImage) return;

        try {
            const res = await axios.patch(`/api/${code}/${song._id}/${instrument._id}/editInstrument`, {image: newImage.name});

            const formData = new FormData();
            formData.append('file', newImage);
    
            axios.post(`/api/${code}/${song._id}/${instrument._id}/addImage`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSongs(res.data);

        } catch (err) {
            console.log(err)
        }

    }

    const getProgressColor = (value) => {
        let color = '#7ec973'

        if (value < 30) color = '#ffa996'
        else if (value < 65) color = '#ffcc96'

        return color;
    }

    const checkAutoFocus = () => {
        if (name === "") return true;
    }

    const [progressStyle, setProgressStyle] = useState({ background: `linear-gradient(to right, ${getProgressColor(progress)} ${instrument.progress}%, #d1d1d1 ${instrument.progress}%)` });

    return (
        <div className="instrument-container">

            <div className="show-instrument">
                
                <Type code={code} song={song} setSongs={setSongs} instrument={instrument}/>

                <input value = {name} autoFocus = {checkAutoFocus()}
                    onChange={(e) => setName(e.target.value)}
                    onBlur = {() => editName()}
                />

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

                { instrument.image !== 'false' ? (
                    <button className="image-show"><img src={imageOnIcon} alt="show-image" onClick={() => onOpenImage()}/></button>
                ) : ( 
                    <>
                        <button className="image-none"><img src={imageOffIcon} alt="add-image"/></button> 
                        <input className="add-image" type="file"
                            onChange={
                                event => {
                                    onAddImage(event.target.files[0])
                                }
                            }/>
                    </>
                )}

                <Menu code={code} song={song} setSongs={setSongs} instrument={instrument} image={instrument.image}/>
            </div>

          { displayImage === true ? (
            <DisplayImage code={code} song={song} instrument={instrument} setDisplayImage={setDisplayImage}/>
        ) : (
            null
        )}

        </div>
    )
}

export default Instrument;