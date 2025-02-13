import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Context from "../AppContext.js";
import bvid from '../Images/BackgroundVideo.mp4'; 
import './Home.css';


// ================================================================================

function Home() {

const navigate = useNavigate();
const { auth } = useContext( Context );
const [ init, setInit ] = useState( false );// Flag for component initialized

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);


useEffect( () => {
    if( init ){
        if( auth ){
            navigate("/videos/*",{ replace: true });  
        }
        window.scrollTo( { top: 0, behavior: 'auto' } );
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

const noContext = ( event ) =>{     // surpress context-menu    

    event.preventDefault();
    return false;
}
  return (
    <div>
        <div>
            <video id="bvid" onContextMenu={ noContext } autoPlay loop muted playsInline>
                    <source src={bvid} type='video/mp4' />
            </video>
        </div>
        <div id="welcome1">mp4streamer-Bibliothek</div>
        <div id="welcome2">Bitte melde dich an</div>
    </div>

  );
}

export default Home;

