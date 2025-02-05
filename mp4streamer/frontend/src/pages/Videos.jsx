import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import videoApi from "../lib/videoApi";
import VideoCard from "../components/VideoCard";
import BusyIndicator from "../components/BusyIndicator.jsx";
import PageNav from "../components/PageNav.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import { pushWinPos, restoreWinPos } from "../utils/RestoreScrollPosX.js"
import "./Videos.css";

/********************************************************************************************
 * 
 */
function Videos() {

const [ videos, setVideos ] = useState( {
    
                            error: false,
                            page: -1,
                            lastPage: -1,
                            count: 0,
                            result: []
} );


const { filter } = useParams( "title=*" );      // search parameter 
let { page } = useParams( 0 );

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const pageEnd = useRef( 0 );                    // reference to the pageend (Position)
const busy = useRef( true );

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

// Save last Window Y-Position
useEffect( () => {

    // install Handler for recording windows position
    if( init ){
        //console.log("VIDEOS enter");
    }
    // remove Handler and save windowsposition
    return () => {

        if( init ){
             //console.log("VIDEOS leave");
             // keep window y-scrollposition - before loading new content! 
                pushWinPos();  
        }
    };
},[ init ]);

// Get videos 
useEffect( () => {

    if( init ){  

        // keep window y-scrollposition - before loading new content! 
        pushWinPos();  

        //console.log(`VIDEOS '${filter} PAGE ${page || 0}' <===================`);

        busy.current = true;
        setVideos( {...videos }, { result: [] } );
        videoApi.find( filter, page, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            
                            busy.current = false;
                            setVideos( () => data );
                        }
        }); 
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ filter, page, init ]);

useEffect(() => {

    if( init ){  

        // save new or restore old window y-scrollposition
        // if browser back-/forward button clicked 
        restoreWinPos(); 
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ videos.result  ]);       


// *** goto next page
const pageDown = () => { 
    
    navigate( `/videos/${filter}/${videos.page +1}` ); 
}
// *** goto previous page
const pageUp = () => {

    navigate( `/videos/${filter}/${videos.page -1}` ); 
}
// *** read videopage
const setPage = ( pageNo = 0 ) => {

    navigate( `/videos/${filter}/${pageNo}` );  
}

if( !busy.current ){
    return (
        <div>
            { !videos.error ?
                <div>
                    {videos.count === 0 &&
                        <h2><br></br><br></br>Keine Videos gefunden..</h2>
                    }    
                    <PageNav page = { videos.page } lastPage = { videos.lastPage } 
                             setPage = { setPage } pageUp = { pageUp } pageDown = { pageDown }
                    />
                    <div className="cardView">
                        {   videos.result.map( ( video, index ) => {
                                return ( <VideoCard key = { index } video = { videos.result[index] } /> );
                            })
                        }
                    </div>
                    <PageNav page = { videos.page } lastPage = { videos.lastPage } 
                             setPage = { setPage } pageUp = { pageUp } pageDown = { pageDown }
                    />
                <span ref={ pageEnd }></span>
                </div>
            : 
                <ModalWin>
                    <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                    <div>
                        <p>
                                { videos.errMsg } 
                        </p>
                        <p><button onClick={ () => setVideos( { error:false, count: 0, result: [] } ) }>Ok</button></p>
                    </div>
                </ModalWin>        
            }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}
export default Videos;
