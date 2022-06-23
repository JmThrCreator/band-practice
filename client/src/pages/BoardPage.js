import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

import Group from '../components/Group';

import '../css/Board.scss';

import axios from 'axios';

const BoardPage = () => {

  const groups = [{ id:1, name:"Learned"}, {id:2, name:"Practice"}, {id:3, name:"Learn"}, {id:4, name:"Suggestions"}];
  const [songs, setSongs] = useState([]);

  useEffect (() => {
    const getSongs = async () => {
      try {
        const res = await axios.get(`/api/songs`);
        setSongs(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    getSongs();
  }, []);

  const filterSongs = (group) => {
    return songs.filter(song => song.group === group.name);
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const sourceId = result.draggableId;
    const group = result.destination.droppableId;
    const source = result.source.droppableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (source !== group) {
      const song = songs.find(song => song._id === sourceId);
      song.group = group;
      setSongs([...songs]);
      try {
        await axios.patch(`/api/${group}/${sourceId}/editSong`, {group: group});
      } catch (err) {
        console.log(err);
      }
    }
  }
  
  return (
    <div className="board">
      <div className = "groups">
        <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
          {groups.map(group => (
            <Group key={group.id} group={group} songs={filterSongs(group)} setSongs={setSongs} />
          ))}
        </DragDropContext>
      </div>
    </div>
  )
};

export default BoardPage;