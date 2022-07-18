import React, { useState, useEffect } from 'react'

import { Droppable, Draggable } from 'react-beautiful-dnd';

import axios from 'axios';

import Song from './Song';

const Add = ({code, setSongs, group}) => {

    const [open, setOpen] = useState(false);
    const template_dict = {
        "none": {
            name: "",
            group: group.name
        },
        "4 rock": {
            name: "",
            group: group.name,
            instruments: [
                {
                    name: "Drums",
                    type: "Drums",
                    progress: 0,
                    image: "false",
                },
                {
                    name: "Bass",
                    type: "Bass",
                    progress: 0,
                    image: "false",
                },
                {
                    name: "Lead",
                    type: "Lead",
                    progress: 0,
                    image: "false",
                },
                {
                    name: "Rhythm",
                    type: "Rhythm",
                    progress: 0,
                    image: "false",
                }
            ]
        },
    }

    useEffect(() => {

        let handler = (e) => {
            if (e.target.id === `add-song-menu-${group._id}`) return
            else if (e.target.id !== group._id) setOpen(false)
        }

        document.addEventListener('click', handler);

        return () => {
            document.removeEventListener('click', handler);
        }

    });

    const onSubmit = async (template) => {

        let submitData = template_dict[template]

        try {
            const res = await axios.post(`/api/${code}/addSong`, submitData);
            setSongs(res.data);

        } catch (err) {
            return;
        }
    };   

    return(
        <div className="add-song-container">
            <button className="add-song" onClick={() => onSubmit("none")}>
                + Add Song
            </button>

            <button id={`add-song-menu-${group._id}`} className="add-song-menu" onClick={() => setOpen(!open)}>...</button>
        
            <div id = {group._id} className={`add-song-menu-container-${open ? 'open' : 'closed'}`}>
                <label>Templates</label>
                <hr/>
                <button className="add-song-menu-item" onClick={() => onSubmit("4 rock")}>4 Rock</button>
            </div>
        </div>
    )
}

const Group = ({code, group, songs, setSongs}) => {

    return (
        <Droppable droppableId={group.name} key={group.id}>
            {(provided, snapshot) => {
                return (
                    <div className="group" ref={provided.innerRef} {...provided.droppableProps} style={{background: snapshot.isDraggingOver ? 'rgb(210, 210, 210, 1)' : 'rgb(225, 225, 225, 1)'}}>
                        
                        <div className="group-header">
                            <h2>{group.name}</h2>
                        </div>     
                        
                        <div>
                            {songs.map((song, index) => {
                                return (
                                    <Draggable key={song._id} draggableId={song._id} index={index}>
                                            {(provided) => {
                                                return (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>    
                                                            <Song key={song._id} code={code} song={song} setSongs={setSongs}/>
                                                    </div>
                                                )
                                            }}
                                    </Draggable>
                                )
                            })}
                        </div>

                        <div className="group-footer">
                            <Add code={code} setSongs={setSongs} group={group} />
                        </div>

                        {provided.placeholder}
                    </div>
                )
            }}
        </Droppable>    
    );
}

export default Group;