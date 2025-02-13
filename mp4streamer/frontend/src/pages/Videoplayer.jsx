import React from "react";
import { useParams } from "react-router-dom";
import { SERVER } from "../config.js";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import './Home.css';


// ================================================================================

function Videoplayer() {

    //const [ init, setInit ] = useState( false );// Flag for component initialized

    let { recno, epiNo } = useParams( null, null );           // video No, episode no
    
    /*
    // set flag for initialized
    useEffect( () => {
        setInit( () => true );
    },[]);

    useEffect(() => {                   // scroll window to top at start  
        if( init ){

            console.log("VIDEOPLAYER enter")
        }    
        return () => {
                if( init ){
                console.log("VIDEOPLAYER leave")
            }
        };
        
    },[init]);
    */
    // ==================================================================

    const noContext = ( event ) =>{     // surpress context-menu    

        event.preventDefault();
        // save new or restore old window y-scrollposition
        //restoreWinPos(); 

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

