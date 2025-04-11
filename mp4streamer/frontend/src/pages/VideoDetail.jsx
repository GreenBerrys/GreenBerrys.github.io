import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { SERVER } from "../config.js";
import "./VideoDetail.css";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import Message from "../components/Message.jsx";
import editFree from "../Images/edit.png"
import editLock from "../Images/editLock.png"


/********************************************************************************************
 * 
 */
function VideoDetail() {

let { recno } = useParams( null );           // video recordnumber

const { setAuth, edit } = useContext( Context );

const navigate = useNavigate();

const busy = useRef( true );
const [ video, setVideo] = useState( {
    
                            error: false,
                            result: [{lock:false, title:"", plot:"", year: 0, genre:"" , tag:"" }]
} );

const [ init, setInit ] = useState( false );            // Flag for component initialized
const [ lockMsg, setLockMsg ] = useState( false );      // Flag for show 'record locked'-Message  
const [ lockChng, setLockChng ] = useState( false );    // Lock state 

const lockPolling = useRef (null);                      // Timer ID for polling loop

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {

    if( init ){

        busy.current = true;

        videoApi.getOne( recno, ( data ) => {

                    if (data.error && data.errMsg ===  "Access denied!" ){

                        // Back to start page when cookie has expired
                        setAuth( false ); 
                        sessionStorage.removeItem("User");
                        navigate( "/" );
                    }
                    else{

                        busy.current = false;
                        setVideo( ( prevVideo ) => data );

                        // set polling loop if record is locked
                        
                        if( data.result[0].lock ){

                           lockPolling.current = setInterval( () => {

                                // check for lock-status
                                videoApi.getLockASync( recno ).then( isLocked => { 

                                        if( !isLocked ) { 

                                                // stop polling loop
                                                clearInterval( lockPolling.current ); 
                                                lockPolling.current = null;

                                                // actualize screen
                                                setLockChng( () => !lockChng );
                                        } 
                                    });
                           }, 2500 );
                        }
                        
                    }
        }); 
    }    
    return () => {
        if( init ){
            if( lockPolling.current ){
                clearInterval( lockPolling.current );
            }    
            //console.log("VIDEODETAIL leave")
        }
    };
    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init, lockMsg, lockChng ]);

// ==================================================================
// Format videotitle
const cut = ( txt ) => {

    if( txt.includes( ' - ' ) ){

        return (<>
                <div className="title">{
                    txt.substring( 0, txt.indexOf( ' - ' ) ).trim()}
               </div>
               <div className="titleText">{ 
                    txt.substring( txt.indexOf( ' - ' )+2 ).replace( ' - ','\n' ).trim() }
                    </div>
               </>)
    }

    return <p className="oneTitle text">{txt}</p>
}
// replace special characters  
const titleURLtrans = ( txt ) => {

    return txt.replaceAll( '/', '%2F' ).replaceAll( ':', '%3A' ).replaceAll( '"', '%22' )
              .replaceAll( '&', '%26' ).replaceAll( '+', '%2B' ).replaceAll( '?', '%3F' );
}
// call editor
const callEditor = ( event )  => {

    event.preventDefault();

    videoApi.getLockASync( recno ).then( ( isLocked => !isLocked ? navigate( "/editor/" + recno ) : setLockMsg( () => true ) ) );

}

// ==================================================================
if( !busy.current ){
    return (
        <div id="videoDetail">

            { lockMsg && <Message txt={ "Video wird gerade bearbeitet!" } func={ ()=>setLockMsg(() => false) }/> }

            <div >
                { !video.error ?
                <>
                    <div id="background" >
                        <img src={ `${SERVER}video/fanart/${video.result[0].recno}.${video.result[0].fanartStamp}` } alt="..."/> 
                    </div>

                    <div id="videoDetailContainer">
                        <div id="title">
                            { cut( video.result[0].title ) }
                            { edit && <img id="editSymb" src={ !video.result[0].lock ? editFree : editLock } alt="edit" onClick={ (e) => callEditor(e) }/> }
                        </div>
                        <img id="poster" src={ `${SERVER}video/poster/${video.result[0].recno}.${video.result[0].posterStamp}` } alt="..."/> 
                        <div id="plot">
                            { video.result[0].plot }
                        </div>
                        <div id="data">
                            <table>
                                <tbody>
                                    <tr>
                                        <th><b>
                                        {   
                                            <Link to={ { pathname: `/index/directors` } }>Regie:</Link>
                                        }
                                        </b></th>        
                                        <td>
                                        {   
                                            video.result[0].director.split(", ").map( ( director, index ) => {
                                                return (
                                                    <Link key = { index } to={ { pathname: `/videos/director=*${director}` } }>
                                                        { index > 0 ? ", " : "" }{ director }   
                                                    </Link>
                                                )
                                            })
                                        }
                                        </td>
                                    </tr>
                                    <tr>
                                        <th><b>Land:</b></th>
                                        <td>
                                        {   
                                            video.result[0].country.split(", ").map( ( country, index ) => {
                                                return (
                                                    <Link key = { index } to={ { pathname: `/videos/country=*${country}` } }>
                                                        { index > 0 ? ", " : "" }{ country }   
                                                    </Link>
                                                )
                                            })
                                        }
                                        </td>
                                    </tr>
                                    <tr>
                                        <th><b>Jahr:</b></th>        
                                        <td>
                                        {   
                                                    <Link to={ { pathname: `/videos/year=${video.result[0].year}` } }>
                                                        { video.result[0].year }   
                                                    </Link>
                                        }
                                        </td>
                                    </tr>
                                    <tr>
                                        <th><b>
                                        {   
                                            <Link to={ { pathname: `/index/genres` } }>Genre:</Link>
                                        }
                                        </b></th>        
                                        <td>
                                        {   
                                            video.result[0].genre.split(", ").map( ( genre, index ) => {
                                                return (
                                                    <Link key = { index } to={ { pathname: `/videos/genre=*${genre}` } }>
                                                        { index > 0 ? ", " : "" }{ genre }   
                                                    </Link>
                                                )
                                            })
                                        }
                                        </td>
                                    </tr>
                                    <tr>                                        
                                        <th><b>
                                        {   
                                            <Link to={ { pathname: `/index/tags` } }>Tag:</Link>
                                        }
                                        </b></th>        
                                        <td>
                                        {   
                                            video.result[0].tag.split(", ").map( ( tag, index ) => {
                                                return (
                                                    <Link key = { index } to={ { pathname: `/videos/tag=*${tag}` } }>
                                                        { index > 0 ? ", " : "" }{ tag }   
                                                    </Link>
                                                )
                                            })
                                        }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {!video.result[0].serie ?
                            <Link  id="player" to={ { pathname: `/player/${video.result[0].recno}` } }>
                                <button className="play">ansehen</button>
                            </Link>
                         :
                            <Link  id="player" to={ { pathname: `/episodes/${video.result[0].recno}/${ titleURLtrans(video.result[0].title ) }` } }>
                                <button className="play">Episoden</button>
                            </Link>
                        }
                    </div>
                    <RestoreWinScrollPos/>
                </>
                : 
                 <Message txt={ video.errMsg } func={ ()=>setVideo( { error:false, count: 0, result: [] } ) }/> 
                }   
            </div>   
        </div>
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}

export default VideoDetail;

