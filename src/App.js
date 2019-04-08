import  React, { useState, useRef, useEffect  } from 'react';
import './App.css';
import { useAudio } from "react-use";
import axios from 'axios';

import backward from './backward.png';
import forward from './forward.png';
import play from './play.png';
import pause from './pause.png';
import mute from './volume-off.png';
import up from './volume-mute.png';
import volumeUp from './volume-up.png';
import volumeDown from './volume-down.png';
import fastRewind from './fast-rewind.png';
import goForward from './go-forward.png';
// import music from './music-notes.png';

const Player = () => {

  // Start song
  const startSongs = [
   {name: "Ты", key: 0, artist: "MÉLOVIN", src: "https://audio-ssl.itunes.apple.com/apple-assets-us…5e63ac136/mzaf_4983125686607941358.plus.aac.p.m4a", img: "https://is5-ssl.mzstatic.com/image/thumb/Music113/…ad09-545c919101bd/193483686295.jpg/55x55bb-85.png", like: false},
  ];

  // SongsFromAPI
  const SongsFromAPI = [];

// request API
  useEffect(() => {
    axios.get('https://itunes.apple.com/ua/rss/topsongs/limit=100/json')
     .then(function (response) {
       let top100uaSongs = response.data.feed.entry;
       for (var i = 0; i < top100uaSongs.length; i++) {
         let link = top100uaSongs[i].link[1].attributes.href;
         let artist = top100uaSongs[i]["im:artist"].label;
         let name = top100uaSongs[i]["im:name"].label;
         let img = top100uaSongs[i]["im:image"][0].label;
         SongsFromAPI.push({name:name, key:i, artist:artist, src: link, img: img, like: false});
       }
       setSongs(SongsFromAPI);
       setSongsSearch(SongsFromAPI);
       saveTasksInLocalStorage(SongsFromAPI);
     })
     .catch(function (error) {
       console.log(error);
     });
   }, []);

  // UseState (state by default)
  const [songs, setSongs] = useState(startSongs);
  const [count, setCount] = useState(0);
  const [volumePercent, setVolumenPercent] = useState("100%");
  const [songsSearch, setSongsSearch] = useState(songs);

  // Get from LocalStorage
  function SongsFromLocalStorage() {
   let returnLocalStorage = JSON.parse(localStorage.getItem("allSongsInLocalStorage"));
   if (returnLocalStorage){
     setSongs (returnLocalStorage.allSongs);
   }
 }

  // Save in LocalStorage
  function saveTasksInLocalStorage(song) {
    let forLocalStorage = {"saveSongs": songs}
    let serialForLocalStorage = JSON.stringify(forLocalStorage);
    localStorage.setItem("allSongsInLocalStorage", serialForLocalStorage);
  }

  // UseAudio
  let [audio, state, controls] = useAudio({
   src: songs[count].src,
   name: songs[count].name,
   artist: songs[count].artist,
   autoPlay: true
  });

  // UseRef
  let nameRef = useRef();

  // Change Time by mouseСlick
  function changeTime(e) {
    let mouseСlick = e.nativeEvent.offsetX;
    controls.seek(state.time = state.duration/400*mouseСlick);
  }

  // Change Volume by mouseСlick
  function changeVolume(e) {
    let mouseСlick = e.nativeEvent.offsetX;
    controls.volume(state.volume = 1/400*mouseСlick);
    setVolumenPercent(Math.floor(1/400*mouseСlick*100)+'%');
  }

  // Change Volume by btn up
  function changeVolumeUp() {
    controls.volume(state.volume = state.volume + 0.2);
    setVolumenPercent(Math.floor(state.volume*100)+'%');
  }

  // Change Volume by btn down
  function changeVolumeDown() {
    controls.volume(state.volume = state.volume - 0.2);
    setVolumenPercent(Math.floor(state.volume*100)+'%');
  }

  // Forward song by btn
  function forwardSong() {
   if (count <= (songs.length-2)){
    setCount(count + 1)
   }
   else{
    setCount(0);
   };
  }

  // Backward song by btn
  function backwardSong() {
   if (count >= 1){
    setCount(count - 1)
   }
   else{
    setCount(songs.length-1);
   };
  }

  // Seconds translate into minutes
  function TimeFormat(time) {
   var hrs = ~~(time / 3600);
   var mins = ~~((time % 3600) / 60);
   var secs = time % 60;
   let ret = "";
   if (hrs > 0) {
     ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
   }
   ret += "" + mins + ":" + (secs < 10 ? "0" : "");
   ret += "" + secs;
   return ret;
  }

  // Filter list of songs (newName)
  const ChangeSearch = () => {
  let newName = nameRef.current.value.toLowerCase();

    function condition(value, index, array) {
      var result = false;
      let long = 0 || newName.length;
      if (value.name.substring(0, long).toLowerCase() === newName  || value.artist.substring(0, long).toLowerCase() === newName) {
          result = true;
      }
      return result;
    }

     setSongsSearch(songs.filter(condition));
  };

  // Background-color class for playing song
  function playingSong(song, count){
    if (song === count){
      return "playingSong";
    } else {
      return "";
    }
  }

  // Color class for like
  function like(song){
    if (song){
      return "like";
    } else {
      return "";
    }
  }

// Switch like
  function doLike(index){
    let Songs = songs;
    if (Songs[index].like){
        Songs[index].like=false;
    } else {
      Songs[index].like=true;
    }
    setSongs(Songs);
    saveTasksInLocalStorage(Songs);
  }

  // List of songs (search)
  const SongsListSearch = () => {
    let songsList = songsSearch.map((song) =>
      <div  key={song.key} id={song.key} onClick={() => setCount(song.key)} className={playingSong(song.key, count)}>
        <img src={song.img} className="play" alt="music"/>
        <p>{song.artist} - {song.name}</p>
        <p onClick={() => doLike(song.key)} className={like(song.like)}>Like</p>
      </div>
    );
    if (songsList.length !== 0){
      return (
        <div className="boxOneSong">{songsList}</div>
      );
    } else {
      return (
        <p>Сhange search parameters...</p>
      );
    }
  }

  return (
   <div className="container">

    <img src={backward} onClick={backwardSong} alt="backward"/>
    {state.isPlaying ? <img src={pause} onClick={controls.pause} alt="pause"/> : <img src={play} onClick={controls.play} alt="play"/>}
    <img src={forward} onClick={forwardSong} alt="forward"/>
    {state.muted ? <img src={up} onClick={controls.unmute} alt="unmute" className="borderRed"/> : <img src={mute} onClick={controls.mute} alt="mute"/>}

    <img src={volumeDown} onClick={changeVolumeDown} alt="volumeDown"/>
    <img src={volumeUp} onClick={changeVolumeUp} alt="volumeUp"/>
    <img src={fastRewind} onClick={() => controls.seek(state.time - 10)} alt="fastRewind"/>
    <img src={goForward} onClick={() => controls.seek(state.time + 10)} alt="goForward"/>

    <p> {audio.props.name} - {audio.props.artist} - {TimeFormat(Math.floor(state.time))} - {TimeFormat(Math.floor(state.duration))} </p>

    <div className="boxFullTime" onClick={changeTime}>
      <div className="boxActualTime" style={{width: 100/state.duration*state.time + '%'}}>
      </div>
    </div>

    <p> Volume: {Math.floor(state.volume*100)} </p>
    <div className="boxFullVolume" onClick={changeVolume}>
       <div className="boxActualVolume" style={{width: volumePercent}}>
       </div>
    </div>

    <div className="displayNone">
       {audio}
       <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>

    <p> Search: </p>
    <input ref={nameRef} type="text" placeholder="Start typing artist or track" onChange={ChangeSearch}/>

    <p>Songs:</p>
    <div>
      <SongsListSearch />
    </div>
   </div>

  );
};

export default Player;
