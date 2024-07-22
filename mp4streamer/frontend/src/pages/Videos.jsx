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
import "./Videos.css";

const  back = { page: 0, scrollPos: 0, pos: 0, filter: "" };

const scrollHandler = () => back.pos = window.pageYOffset;

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


let { filter } = useParams( null );             // search parameter 

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const pageEnd = useRef( 0 );                    // reference to the pageend (Position)
const scrollTo = useRef( 0 );                   // windowsposition to scroll
const busy = useRef( true );

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

// Save last Window Y-Position
useEffect( () => {

    // install Handler for recording windows position
    if( init ){
        window.addEventListener( 'scroll', scrollHandler, { passive: true } );
    }
    // remove Handler and save windowsposition
    return () => {
        if( init ){
            window.removeEventListener( 'scroll', scrollHandler );
            back.scrollPos = back.pos;
        }
    };
},[ init ]);

// Get videos 
useEffect( () => {

    if( init ){  

        if( back.filter !== filter ){
            back.filter = filter || "title=";
            back.page = 0;
            back.scrollPos = 1;
        }
        busy.current = true;
        setVideos( {...videos }, { result: [] } );
        videoApi.find( back.filter, back.page, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            navigate( "/" );
                            sessionStorage.removeItem("User");
                        }
                        else{
                            
                            busy.current = false;
                            setVideos( () => data );
                        }
        }); 
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ filter, init ]);

// Scroll to pageend after pageUp to previous page 
// or last position after browser go to previous pos
useEffect(() => {

    if( init ){  

        switch( scrollTo.current ){
            case 0:                 // scroll to last position
                window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
                break;
            case 1:                 // scroll to top
                window.scrollTo( { top: 0, behavior: 'auto' } );
                break;
            case 2:                 // scroll to bottom
                window.scrollTo( { top: pageEnd.current.offsetTop , behavior: 'auto' } );
                break;
            default:
                break;
        }
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ videos.page, filter ]);       

// *** goto next page
const pageDown = () => { 
    
    scrollTo.current = 1;
    back.page = videos.page +1;
    busy.current = true;
    setVideos( { ...videos }, { result: [] } );
    videoApi.find( filter, back.page , ( data ) => {

                                busy.current = false;
                                setVideos( data ); 
    } );
}
// *** goto previous page
const pageUp = () => {

    scrollTo.current = 2;
    back.page = videos.page -1;
    busy.current = true;
    setVideos( { ...videos }, { result: [] } );
    videoApi.find( filter, back.page , ( data ) => {
        
                                busy.current = false;
                                setVideos( data );  
    });
}
// *** read videopage
const setPage = ( pageNo = 0 ) => {

    scrollTo.current = 1;
    back.page = pageNo;
    busy.current = true;
    setVideos( { ...videos }, { result: [] } );
    videoApi.find( filter, back.page , ( data ) => {

                                busy.current = false;
                                setVideos( data ); 
    } );
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
