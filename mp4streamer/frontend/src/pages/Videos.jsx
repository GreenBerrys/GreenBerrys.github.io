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
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import { showFilter } from "../components/NavMenu.jsx";
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

// Get videos 
useEffect( () => {

    if( init ){  

        //console.log("VIDEOS enter");

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
    /* 
    return () => {

        if( init ){
            console.log("VIDEOS leave");
        }
    };
    */
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ filter, page, init ]);

// update the search display in the NavMenu-componente 
useEffect( () => {
    
    if( init ){
        const search = filter.split( '=' );
        if( search.length === 1)
            showFilter( '', 'title' );
        else
            showFilter( search[ 1 ], search[ 0 ] );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
},[ filter ]);


// ==================================================================

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
                <RestoreWinScrollPos/>
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
