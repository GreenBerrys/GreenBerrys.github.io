import React from "react";
import { useParams } from "react-router-dom";
import { SERVER } from "../config.js";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import './Home.css';


// ================================================================================

function Videoplayer() {

    let { recno, epiNo } = useParams( null, null );           // video No, episode no
    
    // ==================================================================

    const noContext = ( event ) =>{     // surpress context-menu    

        event.preventDefault();
        return false;
    }

    const path = epiNo ? SERVER + `video/stream/${recno}/${epiNo}` : SERVER + `video/stream/${recno}`;
    const poster =  SERVER + `video/poster/${recno}`; 

    try{
        return (
            recno &&
            <div className="player">
                <video style={ { height: 'calc( 99vh - 5rem - 50px )', width: '100%' } } onContextMenu={ noContext } 
                        controls autoPlay playsInline controlsList="nodownload" poster={ poster } >
                    <source src={ path } type="video/mp4"/>
                    Dein Browser unterstützt keine HTML5-Videos
                </video>
                <RestoreWinScrollPos/>
            </div>
        );
    }
    catch( err ){

        console.log( err.message )
    }    
}
export default Videoplayer;

