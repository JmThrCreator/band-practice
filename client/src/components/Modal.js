import React, { useEffect } from 'react';
import ReactDom from 'react-dom';

import closeIcon from '../icons/close.svg';

import Instrument from './Instrument';

import axios from 'axios';

const Add = ({code, setSongs, song}) => {

    const onSubmit = async () => {

        const submitData = {
            name: "",
            type: "Select",
            image: "false",
        }

        try {
            const res = await axios.post(`/api/${code}/${song._id}/addInstrument`, submitData);
            setSongs(res.data);
            
        } catch (err) {
            return;
        }
    };   

    return(
        <>
            <button className="add-instrument" onClick={() => onSubmit()}>
                + Add Instrument
            </button>
        </>
    )
}

const Modal = ({code, song, setSongs, setOpen}) => {

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

    return ReactDom.createPortal(
        <>
            <div id='overlay' className='overlay'>
                <div className='modal'>
                    <div className='modal-header'>
                        <h2>{song.name}</h2>
                        <button onClick={() => setOpen(false)}><img src={closeIcon} alt="close"/></button>
                    </div>

                    <div className='modal-body'>
                        {song.instruments.map((instrument) => (
                            <Instrument key={instrument._id} code={code} song={song} setSongs={setSongs} instrument={instrument} />
                        ))}
                    </div>

                    <div className="instrument-footer">
                        <Add code={code} setSongs={setSongs} song={song}/>
                    </div>

                </div>
            </div>
        </>,
        document.getElementById('modal')
    )
}

export default Modal;