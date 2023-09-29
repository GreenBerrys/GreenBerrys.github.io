import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SERVER } from "../config.js";
import './Home.css';


// ================================================================================

function Videoplayer() {

    const [ init, setInit ] = useState( false );// Flag for component initialized

    let { recno, epiNo } = useParams( null, null );           // video No, episode no

    // set flag for initialized
    useEffect( () => {
        setInit( () => true );
    },[]);

    useEffect(() => {                   // scroll window to top at start  
        if( init ){
            window.scrollTo( { top: 0, behavior: 'auto' } );   
        }    
    },[init]);

    const noContext = ( event ) =>{     // surpress context-menu    

        event.preventDefault();
        return false;
    }

    const path = epiNo ? SERVER + `video/stream/${recno}/${epiNo}` : SERVER + `video/stream/${recno}`;

    try{
        return (
            recno &&
            <div className="player">
                <video style={ { height: 'calc( 99vh - 5rem - 50px )', width: '100%' } } onContextMenu={ noContext } 
                        controls autoPlay playsInline controlsList="nodownload">
                    <source src={ path } type="video/mp4"/>
                    Dein Browser unterstützt keine HTML5-Videos
                </video>
            </div>
        );
    }
    catch( err ){

        console.log( err.message )

    }    
}
export default Videoplayer;

