import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useParams } from "react-router-dom";

import Group from '../components/Group';

import '../scss/Board.scss';

import axios from 'axios';

const BoardPage = () => {

  const { code } = useParams();
  const [validCode, setValidCode] = useState(true)
  const groups = [{ id:1, name:"Learned"}, {id:2, name:"Practice"}, {id:3, name:"Learn"}, {id:4, name:"Suggestions"}];
  const [songs, setSongs] = useState([]);

  useEffect (() => {
    document.body.classList.add('board-background');
    const getSongs = async () => {
      try {
        const res = await axios.get(`/api/${ code }/songs`);
        setSongs(res.data);
      } catch (err) {
        if (err.response.data.message === "code not found") setValidCode(false)
      }
    }
    getSongs();
  }, [code]);

  const filterSongs = (group) => {
    return songs.filter(song => song.group === group.name);
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const sourceId = result.draggableId;
    const group = result.destination.droppableId;
    const source = result.source.droppableId;
    //const sourceIndex = result.source.index;
    //const destinationIndex = result.destination.index;

    if (source !== group) {
      const song = songs.find(song => song._id === sourceId);
      song.group = group;
      setSongs([...songs]);
      try {
        await axios.patch(`/api/${code}/${sourceId}/editSong`, {group: group});
      } catch (err) {
        console.log(err);
      }
    }
  }
  
  return (
    <div className="board">
      { validCode === true ? (       
        <div className = "groups">
          <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
            {groups.map(group => (
              <Group key={group.id} code={code} group={group} songs={filterSongs(group)} setSongs={setSongs} />
            ))}
          </DragDropContext>
        </div>
      ) : (
        <p style={{color: "white"}}>Invalid code; board not found</p>
      )}
    </div>
  )
};

export default BoardPage;