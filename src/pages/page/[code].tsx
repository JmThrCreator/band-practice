import type { NextPage } from "next";
import Error from "next/error"
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import { useState, useEffect, useRef, Fragment } from "react";
import { Listbox, Dialog, Transition, Tab } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, Cog6ToothIcon, AcademicCapIcon, QuestionMarkCircleIcon, TagIcon, UsersIcon } from '@heroicons/react/24/outline';
import BassIcon from "../../assets/icons/bass.svg"
import DrumsIcon from "../../assets/icons/drums.svg"
import KeyboardIcon from "../../assets/icons/keyboard.svg"
import GuitarIcon from "../../assets/icons/guitar.svg"
import VocalsIcon from "../../assets/icons/vocals.svg"
import { useRouter } from 'next/router'
import React from 'react'
import {DndContext, useDroppable, useDraggable, DragOverlay, MouseSensor, useSensor, useSensors} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

const Page: NextPage = () => {

  const utils = trpc.useContext();

  const router = useRouter()
  const code = (typeof router.query.code === "string")  ? router.query.code : ""

  const validateCode = trpc.code.validateCode.useQuery({ code:code })
  
  const stageList = trpc.page.getStageList.useQuery()
  const progressList = trpc.page.getProgressList.useQuery()
  const playerList = trpc.page.getPlayerList.useQuery({ code:code })
  const songList = trpc.song.getSongs.useQuery({ code:code })

  const editSongStage = trpc.song.editSongStage.useMutation({
    async onSuccess() {
      await utils.song.getSongs.invalidate();
    }
  })

  const [activeProgressTags, setActiveProgressTags] = useState<string[]>([])
  const [activePlayerTags, setActivePlayerTags] = useState<string[]>([])

  const [search, setSearch] = useState<string>("")

  const [showTags, setShowTags] = useState(false)
  const [activeSong, setActiveSong] = useState<song>();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 30,
    },
  });

  const sensors = useSensors(
    mouseSensor,
  );

  // eslint-disable-next-line
  function handleDragStart(event:any) {
    const {active} = event;
    setActiveSong(active.data.current.song)
  }

  // eslint-disable-next-line
  function handleDragEnd(event:any) {
    const {active, over} = event;
    if (active && over)
      if (songList && songList.data !== undefined) {
        const index = songList.data.findIndex((x => x.id == active.id))
        const song = songList.data[index]
        if (song !== undefined) song.stage.id = over.id
      }
      if (over !== null) {
        editSongStage.mutateAsync({
          id:active.id,
          stageId:over.id
        })
      }

    setActiveSong(undefined)
  }

  if (validateCode.data !== undefined && validateCode.data !== null && validateCode.data === false) return(<><Error statusCode={404}/></>)
  else {
  return (
    <div className="bg-gray-100">
      <Head>
        <title>Band Practice</title>
        <meta name="description" content="Band Practice" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container flex min-h-screen max-w-full relative flex-col py-10 bg-gray-100">

        <div 
          className="absolute pointer-events-none inset-0" 
          style={{backgroundImage:"linear-gradient(transparrent, transparent);"}}
        />

        <div 
          className="absolute pointer-events-none inset-0 "
          style={{backgroundImage:"linear-gradient(rgba(0, 0, 0, .02) .1em, transparent .1em), linear-gradient(90deg, rgba(0, 0, 0, .02) .1em, transparent .1em); background-size: 2em 2em;", maskImage:"radial-gradient(black, transparent);-webkit-mask-image:radial-gradient(black, transparent)"}}
        />

        <div className="flex sm:mx-auto sm:items-center gap-3 flex-col px-5">
          <div className="gap-2 items-center sm:flex">
            <div className="flex">

              { playerList.data && <PlayerModal code={code} playerList={playerList.data}/> }

              <button
                className={`py-1 px-3 rounded flex font-semibold items-center gap-2 ${showTags ? "text-black" : "text-gray-500"}`}
                onClick={ () => {
                  setShowTags(!showTags)
                }}
              >
                <TagIcon className="w-5 " strokeWidth={1.75}/>
                Filter
              </button>
            </div>
            
            <div className="p-[0.4rem] transition-all flex items-center gap-3">
              <MagnifyingGlassIcon className="w-5 text-gray-500"/>
              <input 
                value={search}
                onChange={(e) => {setSearch(e.target.value)}}
                className="outline-none transition-all bg-transparent px-1 py-1 border-b-gray-300 border-b sm:w-64 w-56 text-gray-800"
                placeholder="Type to search..."
              />
            </div>
          </div>

          <ul className={`gap-5 transition-all + ${showTags ? `flex`: `hidden`}`}>
            { playerList.data !== undefined && <Tag name={"Player"} key={"Player"} options={playerList.data} activeTags={activePlayerTags} setActiveTags={setActivePlayerTags}/>}
            { progressList.data !== undefined && <Tag name={"Progress"} key={"Progress"} options={progressList.data} activeTags={activeProgressTags} setActiveTags={setActiveProgressTags}/>}
          </ul>
          
        </div>

        <section className="flex flex-1 board-scroll mx-10 relative overflow-x-auto scrollbar-x overscroll-contain auto-cols-min">
            <div className="absolute pb-10 whitespace-nowrap top-0 bottom-0 mt-10">
              <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                { stageList.data && stageList.data.map((group:{id:number, name:string}) => (
                  <Group code={code} activeSong={activeSong} group={group} key={group.id} songList={songList.data} activeProgressTags={activeProgressTags} activePlayerTags={activePlayerTags} search={search}/>
                ))}
                <DragOverlay>
                  {activeSong ? <Song code={code} song={activeSong} activeProgressTags={activeProgressTags} activePlayerTags={activePlayerTags} search={search}/> : null}
                </DragOverlay>
              </DndContext>
            </div>
        </section>

      </main>

    </div>
  );
  }
};

export default Page;

type TagProps = {
  name: string;
  options: {id:string|number, name:string}[];
  activeTags: string[];
  setActiveTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const Tag = ({
  name,
  options,
  activeTags,
  setActiveTags,
}: TagProps) => {
  
  return (
    <div>
      <Listbox value={activeTags} onChange={setActiveTags} as="div" className="flex flex-col sm:items-center" multiple>
        <Listbox.Button className={`z-10 font-semibold rounded-full ${activeTags.length > 0 ? "bg-sky-100/50 text-sky-500 border-sky-300/60" : "bg-white/40 text-gray-500 border-gray-300/70" }   border px-4 py-0.5  flex items-center gap-2`}>
          {name}
          <ChevronDownIcon strokeWidth={1.75} className="w-4 h-4 mt-0.5"/>
        </Listbox.Button>
  
        <Listbox.Options className="z-20 absolute shadow-lg rounded p-2 w-56 bg-white mt-10 border gap-1 flex flex-col">
          { options && options.length > 0 ? options.map(option => (
            <Listbox.Option 
              key={option.id}
              as="button"
              value={option.name}
              disabled={false}
              className="text-left flex items-center rounded py-1 px-2 w-full hover:bg-gray-100 ui-selected:text-sky-500 ui-selected:bg-sky-400/10"
            >
              {option.name}
              <CheckIcon className="invisible ml-auto text-sky-500 ui-selected:visible w-6 px-1" />
            </Listbox.Option>
          )) :
            <div className="text-gray-500">No results</div>
          }
        </Listbox.Options>
      </Listbox>
    </div>
    
  );
};

type GroupProps = {
  code: string;
  group: {
    id: number,
    name: string
  };
  songList: { 
    id: string,
    name: string,
    progress: {id:number, name:string},
    stage: {id:number, name:string}
  }[] | undefined;
  activeSong: {
    id: string,
    name: string,
    progress: {id:number, name:string},
    stage: {id:number, name:string}
  } | undefined;
  activeProgressTags: string[];
  activePlayerTags: string[];
  search:string;
};

const Group = ({
  group,
  songList,
  code,
  activeSong,
  activeProgressTags,
  activePlayerTags,
  search,
}: GroupProps) => {

  const utils = trpc.useContext();

  const createSong = trpc.song.createSong.useMutation({
    async onSuccess() {
      await utils.song.getSongs.invalidate();
    },
  });

  const filteredList = songList?.filter( 
    x => 
    (x.stage.id === group.id)
  )

  const {setNodeRef, isOver} = useDroppable({
    id: group.id,
  });

  //h-[15rem] md:h-[18rem] xl:h-[20rem] 2xl:h-[30rem]

  return (
    <div ref={setNodeRef} className={`p-5 pb-20 h-full inline-block whitespace-nowrap align-top mr-5 z-10 w-80 ${ isOver ? "bg-[#f5f7f8]/40" : "bg-white/40"} rounded-xl border shadow-black/5`}>
      <div className="font-bold text-xl mb-5 flex text-gray-700 items-center">
        { group.name }
        <button 
          className="ml-auto"
          onClick={() => { 
            createSong.mutateAsync({ 
              code:code, 
              data:{
                stageId:group.id,
              } 
            })
          }}
        >
          <div className="p-0.25 hover:bg-gray-600/10 rounded">
            <PlusIcon className="h-7 text-gray-500"/>
          </div>
        </button>
      </div>

      <div className="overscroll-contain scrollbar-y pr-3 overflow-y-auto h-full">

        <div className="flex flex-col gap-3 pb-5">
        { filteredList && filteredList.length > 0 && filteredList.map(song => (
          <React.Fragment key={song.id}>
            { activeSong !== undefined ? 
              <>
                { 
                  activeSong.id !== song.id &&
                  <Song song={song} code={code} activeProgressTags={activeProgressTags} activePlayerTags={activePlayerTags} search={search}/>
                }
              </>
            : 
              <Song song={song} code={code} activeProgressTags={activeProgressTags} activePlayerTags={activePlayerTags} search={search}/>
            }
          </React.Fragment>
        ))}
        </div>
      </div>

    </div>
  );
};

type song = {
  id: string,
  name: string,
  progress: {id:number, name:string},
  stage: {id:number, name:string}
};

type SongProps = {
  code: string;
  song: { 
    id: string,
    name: string,
    progress: {id:number, name:string},
    stage: {id:number, name:string}
  };
  activeProgressTags: string[];
  activePlayerTags: string[];
  search:string;
};

const Song = ({
  song,
  code,
  activeProgressTags,
  activePlayerTags,
  search
}: SongProps) => {

  const utils = trpc.useContext();

  const editSongProgress = trpc.song.editSongProgress.useMutation({
    async onSuccess() {
      await utils.song.getSongs.invalidate();
    }
  })

  const songEntryList = trpc.songEntry.getSongEntryList.useQuery({ songId: song.id }, {
    onSuccess: (songEntryList) => {
      if (songEntryList === undefined) return
  
      let minProgress = songEntryList.length > 0 ? 1 : 4;
      for (let i=0; i<songEntryList.length; i++) {
        const progressId = songEntryList[i]?.progress.id
        if (progressId !== undefined && progressId > minProgress) {
          minProgress = progressId
        }
      }
      if (minProgress !== song.progress.id) {
        editSongProgress.mutateAsync({ id:song.id, progressId:minProgress });
      }
    }
  })

  const deleteSong = trpc.song.deleteSong.useMutation({
    async onSuccess() {
      await utils.song.getSongs.invalidate();
    },
  });

  const editSongName = trpc.song.editSongName.useMutation({
    async onSuccess() {
      await utils.song.getSongs.invalidate();
    },
  });

  const [name, setName] = useState(song.name)
  const [mouseEnter, setMouseEnter] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(song.progress.name)

  const textRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textRef.current === null) return
    else if (song.name==="") textRef.current.disabled = false
    else textRef.current.disabled = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const checkAutoFocus = () => {
    if (name === "") return true
    else return false
  }

  function openModal() {
    setIsOpen(true)
    setMouseEnter(false)
  }

  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: song.id,
    data: {song},
    disabled: isOpen
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const filterTags = () => {

    // if player tags contains more or less than 1 player, reset to default
    if (activePlayerTags.length !== 1 && progress!==song.progress.name) setProgress(song.progress.name)

    // filter search
    if (search !== "" && !song.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) return false;

    // make TS happy
    if (songEntryList.data === undefined || songEntryList.data === null) return false;
    const songEntries = songEntryList.data

    // filters players
    if (activePlayerTags.length > 0 && songEntryList !== undefined) {
      for (const songEntry of songEntries){
        const playerName = songEntry?.player?.name
        if (typeof playerName === "string" && activePlayerTags.indexOf(playerName) >= 0) {

          // if player list contains 1 player, apply that player's progress to the songs
          if (activePlayerTags.length === 1) {
            const progressName = songEntry.progress?.name
            if (progress !== progressName && typeof progressName === "string") setProgress(progressName)

            // filter tags to the player's progress
            if (activeProgressTags.length > 0) {
              for (const progressTag of activeProgressTags) {
                if (typeof progressName === "string" && typeof progressTag !== undefined && progressName === progressTag) break
                if (activeProgressTags.indexOf(progressTag) === activeProgressTags.length-1) return false
              }
            }
            break
          } else break
        }
        if (songEntries.indexOf(songEntry) === songEntries.length-1) return false
      } 
    }
    
    // filters default progress if there are multiple or no players
    if (activeProgressTags.length > 0 && activePlayerTags.length !== 1) {
      for (const progressTag of activeProgressTags){
        if (typeof progressTag !== undefined && progressTag === song.progress.name) break;
        if (activeProgressTags.indexOf(progressTag) === activeProgressTags.length-1) return false
      }
    }

    return true
  };

  return (
    <>
    {
      filterTags() &&
      <div
      className="text-left relative p-2 h-12 bg-white rounded hover:bg-gray-100 flex items-start cursor-pointer border shadow-black/5" 
      onMouseOver={() => {setMouseEnter(true)}}
      onMouseOut={() => {setMouseEnter(false)}}
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      >
        <div 
          className="h-full flex gap-2 items-center outline-none caret-transparent"
          onClick={() => { openModal()} }
        >
          <div className="flex mt-0.5 gap-2 text-gray-400 items-center">
            { progress === "Learned" &&
              <CheckCircleIcon className="w-5 text-sky-400 "/>
            }
            { progress === "Practice" &&
              <Cog6ToothIcon className="w-5 text-amber-400 "/>
            }
            { progress === "Learn" &&
              <AcademicCapIcon className="w-5 text-orange-400 "/>
            }
            { progress === "Undefined" &&
              <QuestionMarkCircleIcon className="w-5 text-gray-400 "/>
            }
          </div>
          <input 
            id={song.id} 
            ref={textRef}
            value={name}
            autoFocus={checkAutoFocus()}
            autoComplete="off"
            className={`
              bg-transparent outline-none caret-current w-36 overflow-ellipsis
              disabled:caret-transparent cursor-pointer
              ${name==="Undefined" && "text-gray-400"}`
            }
            onChange={(e) => { setName(e.target.value)} }
            onSelect={() => {
              if (name==="Undefined") setName("")
            }}
            onKeyPress = {(e) => {
              if (e.key !== "Enter") return;
              else if (textRef.current !== null) textRef.current.blur();
            }}
            onBlur = {() => {
              if (textRef.current !== null) textRef.current.disabled = true
              if (!name || name==="") {
                editSongName.mutateAsync({ id:song.id, name:"Undefined" })
                setName("Undefined")
              }
              else {
                editSongName.mutateAsync({ id:song.id, name:name })
              }
            }}
          >
          </input>
        </div>

        { mouseEnter && 
          <div className="absolute right-0 mr-2 gap-2 flex">
            <button 
              className="p-1.5 border rounded hover:bg-gray-200"
              onClick ={() => {
                if (textRef.current !== null) {
                  textRef.current.disabled = false
                  textRef.current.focus()
                }
              }}
            >
              <PencilIcon className="h-4 text-gray-500"/>
            </button>
            <button
              className="p-1.5 border rounded hover:bg-gray-200"
              onClick={() => { 
                deleteSong.mutateAsync({ id:song.id })
              }}>
              <TrashIcon className="h-4 text-gray-500"/>
            </button>
          </div>
        }

        { songEntryList.data !== undefined &&
          <SongModal setMouseEnter={setMouseEnter} code={code} setIsOpen={setIsOpen} isOpen={isOpen} song={song} songEntryList={songEntryList.data}/>
        }
        </div>
    }
    </>
  )
};

type SongModalProps = {
  setMouseEnter: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  song: song;
  songEntryList: {
    id: string;
    name: string;
    songId: string;
    player: { id:string, name:string, pageId:string } | null;
    progress: { id:number, name:string };
    instrument: { id:number, name:string };
  }[];
  code:string;
}

const SongModal = ({
  setMouseEnter,
  setIsOpen,
  isOpen,
  song,
  songEntryList,
  code,
}: SongModalProps) => {

  const utils = trpc.useContext();

  const createSongEntry = trpc.songEntry.createSongEntry.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate();
    },
  });

  function closeModal() {
    setIsOpen(false)
    setMouseEnter(false)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={closeModal}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex mt-20 justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full gap-3 flex flex-col max-w-sm transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium text-gray-900 flex"
              >
                {song.name}
                <button 
                  className="p-0.25 h-7 mx-2 hover:bg-gray-600/10 rounded ml-auto cursor-pointer outline-none"
                  onClick={() => { 
                    createSongEntry.mutateAsync({ 
                      songId:song.id
                    })
                  }}
                >
                  <PlusIcon className="h-7 text-gray-500"/>
                </button>
              </Dialog.Title>

              <div className="flex gap-3 mt-3 flex-col">
                { songEntryList && songEntryList.length > 0 && songEntryList.map((songEntry) => (
                  <SongEntry code={code} songEntry={songEntry} song={song} key={songEntry.id} />
                ))}
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
  )
}

type SongEntryProps = {
  code: string;
  song:song;
  songEntry: {
    id: string;
    name: string;
    songId: string;
    player: { id:string, name:string, pageId:string } | null;
    progress: { id:number, name:string };
    instrument: { id:number, name:string };
  };
};

const SongEntry = ({
  songEntry,
  song,
  code
}: SongEntryProps) => {

  const utils = trpc.useContext();

  const textRef = useRef<HTMLInputElement>(null);

  const deleteSongEntry = trpc.songEntry.deleteSongEntry.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate({ songId: song.id });
    },
  });

  const editSongEntryName = trpc.songEntry.editSongEntryName.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate({ songId: song.id });
    }
  })

  const editSongEntryProgress = trpc.songEntry.editSongEntryProgress.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate({ songId: song.id });
    }
  })

  const editSongEntryInstrument = trpc.songEntry.editSongEntryInstrument.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate({ songId: song.id });
    }
  })

  const editSongEntryPlayer = trpc.songEntry.editSongEntryPlayer.useMutation({
    async onSuccess() {
      await utils.songEntry.getSongEntryList.invalidate({ songId: song.id });
    }
  })

  const instrumentList = trpc.page.getInstrumentList.useQuery()
  const playerList = trpc.page.getPlayerList.useQuery({ code:code })

  const [mouseEnter, setMouseEnter] = useState(false)
  const [name, setName] = useState(songEntry.player && songEntry.name === "" ? "Undefined" : songEntry.name)
  const [progress, setProgress] = useState(songEntry.progress.id)
  const [selectedInstrument, setSelectedInstrument] = useState(songEntry.instrument)
  const [selectedPlayer, setSelectedPlayer] = useState(songEntry.player)

  return (
    <div 
      className="text-left justify-start pl-2 h-16 rounded flex items-center border shadow-lg shadow-black/5"
      onMouseEnter={() => {setMouseEnter(true)}}
      onMouseLeave={() => {setMouseEnter(false)}}
    >
      <Listbox>
        <Listbox.Button>
          { selectedInstrument.name === "Bass" && <BassIcon height="40px" className="pl-1" /> }
          { selectedInstrument.name === "Drums" && <DrumsIcon height="40px" className="pl-1" /> }
          { selectedInstrument.name === "Keyboard" && <KeyboardIcon height="40px" className="pl-1" /> }
          { selectedInstrument.name === "Guitar" && <GuitarIcon height="40px" className="pl-1" /> }
          { selectedInstrument.name === "Vocals" && <VocalsIcon height="40px" className="pl-1" /> }
          { selectedInstrument.name === "Undefined" && <div className="h-[40px] w-[40px] pl-1" /> }
        </Listbox.Button>
        <Listbox.Options className="absolute bg-white gap-5 flex flex-row h-12 z-20" as="div">
          { instrumentList.data && instrumentList.data.length > 0 && instrumentList.data.map(instrument => (
            <Listbox.Option 
              key={instrument.id}
              as="button"
              value={instrument.name}
              className=""
              onClick={()=>{
                editSongEntryInstrument.mutateAsync({id:songEntry.id, instrumentId:instrument.id})
                setSelectedInstrument(instrument)
                if (songEntry.name === "Undefined" || songEntry.name==="") textRef.current?.focus()
              }}
            >
              { instrument.name === "Bass" && <BassIcon height="40px" className="pl-1" /> }
              { instrument.name === "Drums" && <DrumsIcon height="40px" className="pl-1" /> }
              { instrument.name === "Keyboard" && <KeyboardIcon height="40px" className="pl-1" /> }
              { instrument.name === "Guitar" && <GuitarIcon height="40px" className="pl-1" /> }
              { instrument.name === "Vocals" && <VocalsIcon height="40px" className="pl-1" /> }
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>

      { songEntry.instrument.name === "Undefined" &&
        <div className="absolute bg-white gap-5 flex h-12 z-20">
          { instrumentList.data && instrumentList.data.length > 0 && instrumentList.data.map(instrument => (
            <button
              key={instrument.id}
              className=""
              onClick={()=>{
                editSongEntryInstrument.mutateAsync({id:songEntry.id, instrumentId:instrument.id})
                setSelectedInstrument(instrument)
                if (songEntry.name==="") textRef.current?.focus()
              }}
            >
            { instrument.name === "Bass" && <BassIcon height="40px" className="pl-1" /> }
            { instrument.name === "Drums" && <DrumsIcon height="40px" className="pl-1" /> }
            { instrument.name === "Keyboard" && <KeyboardIcon height="40px" className="pl-1" /> }
            { instrument.name === "Guitar" && <GuitarIcon height="40px" className="pl-1" /> }
            { instrument.name === "Vocals" && <VocalsIcon height="40px" className="pl-1" /> }
          </button>
          ))}
        </div>
      }

      <div className="flex items-center w-full">
        <div className="flex flex-col items-start pl-3">

          <input 
            value={name}
            ref={textRef}
            className={`
              h-6 bg-transparent cursor-text outline-none caret-current w-40
              disabled:caret-transparent disabled:cursor-pointer
              ${name==="Undefined" && "text-gray-400"}`
            }
            onChange={(e) => { setName(e.target.value)} }
            onSelect={() => {
              if (name==="Undefined") setName("")
            }}
            onKeyPress = {(e) => {
              if (e.key !== "Enter") return;
              else if (textRef.current !== null) textRef.current.blur();
            }}
            onBlur = {() => {
              if (!name || name==="") {
                editSongEntryName.mutateAsync({ id:songEntry.id, name:"Undefined" })
                setName("Undefined")
              }
              else {
                editSongEntryName.mutateAsync({ id:songEntry.id, name:name })
              }
            }}
            />

          <div className="flex gap-1 items-center">
            <button 
              className="outline-none"
              onClick = {() => {
                setProgress(1)
                editSongEntryProgress.mutateAsync({ id:songEntry.id, progressId:1 })
              }}
            >
            <CheckCircleIcon className={`h-5 cursor-pointer ${progress === 1 ? "text-sky-400" : "text-gray-200 hover:text-gray-300"}`}/>
            </button>  
            <button 
              className="outline-none"
              onClick = {() => {
                setProgress(2)
                editSongEntryProgress.mutateAsync({ id:songEntry.id, progressId:2 })
              }}
            >
            <Cog6ToothIcon className={`h-5 cursor-pointer ${progress === 2 ? "text-amber-400" : "text-gray-200 hover:text-gray-300"}`}/> 
            </button>
            <button 
              className="outline-none"
              onClick = {() => {
                setProgress(3)
                editSongEntryProgress.mutateAsync({ id:songEntry.id, progressId:3 })
              }}
            >
            <AcademicCapIcon className={`h-5 cursor-pointer ${progress === 3 ? "text-orange-400" : "text-gray-200 hover:text-gray-300"}`}/> 
            </button>
            <button 
              className="outline-none"
              onClick = {() => {
                setProgress(4)
                editSongEntryProgress.mutateAsync({ id:songEntry.id, progressId:4 })
              }}
            >
            <QuestionMarkCircleIcon className={`h-5 cursor-pointer ${progress === 4 ? "text-gray-400" : "text-gray-200 hover:text-gray-300"}`}/>
            </button>

            <Listbox className={"relative ml-2"} as="div">
              <Listbox.Button className={`z-10`}>
                <div className="text-sm h-7 w-24 text-gray-400 rounded hover:bg-gray-100 p-1 text-left ">
                  {selectedPlayer ? selectedPlayer.name : "Undefined"}
                </div>
              </Listbox.Button>
              <Listbox.Options className="absolute rounded z-10 mt-1 p-1 bg-white shadow-sm text-sm border gap-1 flex flex-col " as="div">
                { playerList.data && playerList.data.length > 0 && playerList.data.map(player => (
                  <Listbox.Option 
                    key={player.id}
                    as="button"
                    value={player.name}
                    className=" hover:bg-gray-100 bg-white w-32 text-left p-1 rounded"
                    onClick={()=>{
                      setMouseEnter(false)
                      editSongEntryPlayer.mutateAsync({id:songEntry.id, playerId:player.id})
                      setSelectedPlayer(player)
                    }}
                  >
                    {player.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
        </div>
        { mouseEnter && 
            <div className=" ml-auto gap-2 flex mr-5">
              <button
                className="p-1.5 border rounded hover:bg-gray-200"
                onClick ={() => {
                  deleteSongEntry.mutateAsync({ id:songEntry.id })
                }}>
                <TrashIcon className="h-4 text-gray-500"/>
              </button>
            </div>
          }
      </div>

      
    </div>
  )
}

type PlayerModalProps = {
  code: string;
  playerList: {
    id:string;
    instrumentId:number;
    name:string;
    pageId:string;
    default:boolean;
  }[];
}

const PlayerModal = ({
  code,
  playerList,
}: PlayerModalProps) => {

  const utils = trpc.useContext();

  const createPlayer = trpc.page.createPlayer.useMutation({
    async onSuccess() {
      await utils.page.getPlayerList.invalidate();
    },
  });

  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0)

  return (
    <div>
      <button 
        className={`py-1 px-3 items-center rounded ${isOpen ? "text-black" : "text-gray-500"} font-semibold flex gap-2`}
        onClick={ () => {
          setIsOpen(true)
        }}
      >
        <UsersIcon className="w-5" strokeWidth={1.75}/>
        Players
      </button>

      <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {setIsOpen(false)}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex mt-20 justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium text-gray-900 flex"
                >
                  Players
                  <button 
                    className="p-0.25 hover:bg-gray-600/10 rounded ml-auto cursor-pointer outline-none"
                    onClick={() => { 
                      createPlayer.mutateAsync({code:code, default:(selectedPlayerIndex === 0 ? true : false)})
                    }}
                  >
                    <PlusIcon className="h-7 text-gray-500"/>
                  </button>
                </Dialog.Title>
                <Tab.Group defaultIndex={1} selectedIndex={selectedPlayerIndex} onChange={setSelectedPlayerIndex}>
                  <Tab.List className="w-fit flex mt-3 p-1 justify-center gap-1 bg-gray-500/10 rounded-full">
                    <Tab className={`px-4 py-0.5 ui-selected:bg-white  hover:bg-white/20 rounded-full`}>Default</Tab>
                    <Tab className="px-4 py-0.5 ui-selected:bg-white hover:bg-white/20 rounded-full">Auxiliary</Tab>
                  </Tab.List>

                  <Tab.Panels className="mt-3">
                    <Tab.Panel className="flex flex-col gap-3">
                      { playerList && playerList.map((player) => (
                        <React.Fragment key={player.id}>
                          { player.default && <Player player={player} /> }
                        </React.Fragment>
                      ))}
                    </Tab.Panel>
                    <Tab.Panel className="flex flex-col gap-3">
                      { playerList && playerList.map((player) => (
                        <React.Fragment key={player.id}>
                        { player.default === false && <Player player={player} key={player.id}/> }
                        </React.Fragment>
                      ))}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      </Transition>
    </div>
  )
}

type PlayerProps = {
  player: {
    id:string;
    instrumentId:number;
    name:string;
    pageId:string;
  };
}

const Player = ({
  player,
}: PlayerProps) => {

  const utils = trpc.useContext();

  const editPlayerInstrument = trpc.page.editPlayerInstrument.useMutation({
    async onSuccess() {
      await utils.page.getPlayerList.invalidate();
    },
  });

  const editPlayerName = trpc.page.editPlayerName.useMutation({
    async onSuccess() {
      await utils.page.getPlayerList.invalidate();
    },
  });

  const deletePlayer = trpc.page.deletePlayer.useMutation({
    async onSuccess() {
      await utils.page.getPlayerList.invalidate();
    },
  });

  const instrumentList = trpc.page.getInstrumentList.useQuery()

  const [selectedInstrument, setSelectedInstrument] = useState(player.instrumentId)
  const [name, setName] = useState(player.name)
  const [mouseEnter, setMouseEnter] = useState(false)

  const textRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className="border rounded flex h-[3.75rem] pl-2 items-center gap-2 overflow-hidden"
      onMouseOver={() => {setMouseEnter(true)}}
      onMouseOut={() => {setMouseEnter(false)}}
    >
      <Listbox>
        <Listbox.Button>
          { selectedInstrument === 1 && <BassIcon height="40px" className="pl-1" /> }
          { selectedInstrument === 2 && <DrumsIcon height="40px" className="pl-1" /> }
          { selectedInstrument === 3 && <KeyboardIcon height="40px" className="pl-1" /> }
          { selectedInstrument === 4 && <GuitarIcon height="40px" className="pl-1" /> }
          { selectedInstrument === 5 && <VocalsIcon height="40px" className="pl-1" /> }
          { selectedInstrument === 6 && <div className="h-[40px] w-[40px] pl-1" /> }
        </Listbox.Button>

        <Listbox.Options className="absolute bg-white gap-5 flex flex-row h-12 z-20" as="div">
          { instrumentList.data && instrumentList.data.length > 0 && instrumentList.data.map(instrument => (
            <Listbox.Option 
              key={instrument.id}
              as="button"
              value={instrument.name}
              className=""
              onClick={()=>{
                editPlayerInstrument.mutateAsync({ id:player.id, instrumentId:instrument.id });
                setSelectedInstrument(instrument.id)
              }}
            >
              { instrument.name === "Bass" && <BassIcon height="40px" className="pl-1" /> }
              { instrument.name === "Drums" && <DrumsIcon height="40px" className="pl-1" /> }
              { instrument.name === "Keyboard" && <KeyboardIcon height="40px" className="pl-1" /> }
              { instrument.name === "Guitar" && <GuitarIcon height="40px" className="pl-1" /> }
              { instrument.name === "Vocals" && <VocalsIcon height="40px" className="pl-1" /> }
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>

      { selectedInstrument === 6 &&
        <div className="absolute bg-white gap-5 flex flex-row h-12 z-20">
          { instrumentList.data && instrumentList.data.length > 0 && instrumentList.data.map(instrument => (
            <button
              key={instrument.id}
              className=""
              onClick={()=>{
                editPlayerInstrument.mutateAsync({id:player.id, instrumentId:instrument.id})
                setSelectedInstrument(instrument.id)
                if (player.name==="") textRef.current?.focus()
              }}
            >
            { instrument.name === "Bass" && <BassIcon height="40px" className="pl-1" /> }
            { instrument.name === "Drums" && <DrumsIcon height="40px" className="pl-1" /> }
            { instrument.name === "Keyboard" && <KeyboardIcon height="40px" className="pl-1" /> }
            { instrument.name === "Guitar" && <GuitarIcon height="40px" className="pl-1" /> }
            { instrument.name === "Vocals" && <VocalsIcon height="40px" className="pl-1" /> }
          </button>
          ))}
        </div>
      }

      <div className="ml-2">
      <input 
            value={name}
            ref={textRef}
            className={`
              h-6 bg-transparent cursor-text outline-none caret-current w-40
              disabled:caret-transparent disabled:cursor-pointer
              ${name==="Undefined" && "text-gray-400"}`
            }
            onChange={(e) => { setName(e.target.value)} }
            onSelect={() => {
              if (name==="Undefined") setName("")
            }}
            onKeyPress = {(e) => {
              if (e.key !== "Enter") return;
              else if (textRef.current !== null) textRef.current.blur();
            }}
            onBlur = {() => {
              if (!name || name==="") {
                editPlayerName.mutateAsync({ id:player.id, name:"Undefined" })
                setName("Undefined")
              }
              else {
                editPlayerName.mutateAsync({ id:player.id, name:name })
              }
            }}
            />
      </div>
      {mouseEnter &&
        <div className=" ml-auto gap-2 flex mr-5">
          <button
            className="p-1.5 border rounded hover:bg-gray-200"
            onClick ={() => {
              deletePlayer.mutateAsync({ id:player.id })
            }}>
            <TrashIcon className="h-4 text-gray-500"/>
          </button>
        </div>
      }
    </div>
  )
}