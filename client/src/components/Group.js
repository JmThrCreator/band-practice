import React, {useEffect, useState} from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import axios from 'axios';

import Song from './Song';

const Form = ({setSongs, group}) => {

    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);

    const onSubmit = async () => {
        if (name.length > 0) {
            try {
                const res = await axios.post(`/api/${group.name}/addSong`, {name: name});
                setSongs(res.data);
                setName('');
                setOpen(false);
            }
            catch (err) {
                console.log(err);
            }
        }
    };

    return(
        <>
            <button className="add-song" onClick={() => setOpen(!open)}>
                + Add Song
            </button>

            <div className = "add-song-form">
                <div className={open ? 'open' : 'closed'}>
                    <input type="text" value={name} placeholder="Song name" onChange={e => setName(e.target.value)} />
                    <button type="button" onClick={() => onSubmit()}>Add song</button>
                </div>
            </div>
        </>
    )
}

const Group = ({group, songs, setSongs}) => {

    return (
        <Droppable droppableId={group.name} key={group.id}>
            {(provided, snapshot) => {
                return (
                    <div className="group" ref={provided.innerRef} {...provided.droppableProps} style={{background: snapshot.isDraggingOver ? 'rgb(210, 210, 210, 1)' : 'rgb(225, 225, 225, 1)'}}>
                        
                        <div className="group-header">
                            {group.name}
                        </div>     
                        
                        <div>
                            {songs.map((song, index) => {
                                return (
                                    <Draggable key={song._id} draggableId={song._id} index={index}>
                                            {(provided, snapshot) => {
                                                return (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>    
                                                            <Song key={song._id} song={song} setSongs={setSongs} group={group} songs={songs}/>
                                                    </div>
                                                )
                                            }}
                                    </Draggable>
                                )
                            })}
                        </div>

                        <div className="group-footer">
                            <Form setSongs={setSongs} group={group} />
                        </div>

                        {provided.placeholder}
                    </div>
                )
            }}
        </Droppable>    
    );
};

export default Group;