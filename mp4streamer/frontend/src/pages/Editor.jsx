import React, { useState, useEffect, useRef, useContext} from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
import { showMenu } from "../components/NavMenu.jsx";
import VideoEdit from "../components/VideoEdit.jsx";
import EpisodeEdit from "../components/EpisodeEdit.jsx";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import "./Editor.css";
import { SERVER } from "../config.js";

/********************************************************************************************
 * 
 */
function Editor() {

let { recno } = useParams( null );              // video record no.
    
const [ init, setInit ] = useState( false );    // Flag for component initialized
const busy = useRef( true );                    // Flag for waiting warten (loading )
const navigate = useNavigate();

const { setAuth } = useContext( Context );      // Loginstate

const [ lockMsg, setLockMsg ] = useState( false ); // Versuch gelockten Videorecord zu beareiten

// --------------------------------------
let [ dataChanged, setDataChanged ] = useState( false );         // Flag for Videodata changed
let [ epiDataChanged, setEpiDataChanged ] = useState ( false );
let [ thumbChanged, setThumbChanged ] = useState( false ); 
// --------------------------------------
const [ epiEdit, setEpiEdit ] = useState( false );

const [ vdata, setVdata ] = useState( {     // Videodata
    
            error: false,
            result: []
});

const [ edata, setEdata ] = useState( {     // Episodes data

            error: false,
            result: []
});

const epiDataChng = useRef([ {     // Episodes data changed flag
    
    changed: false,                             
}]);

const thumb = useRef([ {     // Episodes thumbs
    
    new: false,                             // Flag for thumb changed
    url: ``,                                // thumb URL for IMG-tag
    file: null,                             // File object
    err: false
}]);

const [ poster, setPoster ] = useState( {       // Posterdata
    
    new: false,                                 // Flag for Poster changed
    url: ``,                                    // Poster URL for IMG-tag
    file: null,                                 // File object
    err: false
});
const [ fanart, setFanart ] = useState( {       // Fanartdata
    
    new: false,                                 // Flag for Fanart changed
    url: ``,                                    // Fanart URL for IMG-tag
    file: null,                                 // File object
    err: false
});

const key = useRef("");         // lock key

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

// Unlock video-record by browser exit / tab change
const unLock = () => { 

    if( key.current.length ){
        videoApi.setLock( recno, false, key.current );
        key.current = "";
    }

};

useEffect(() => {

    if( init ){

        showMenu( false );
        busy.current = true;

        // lock videorecord
        videoApi.setLockASync( recno, true )
        
        .then( lockKey => lockKey.result.length ? key.current = lockKey.result[0].key :  setLockMsg( () => true ))

        // get videorecord
        .then(
            videoApi.getOne( recno, ( data ) => {

                    if (data.error && data.errMsg ===  "Access denied!" ){

                        // Back to start page when cookie has expired
                        setAuth( false ); 
                        sessionStorage.removeItem("User");
                        navigate( "/" );
                    }
                    else{
                        setVdata( () => data );
                        setPoster( {...poster, new: false, url: `${SERVER}video/poster/${recno}.${data.result[0].posterStamp}`, file: null})
                        setFanart( {...fanart, new: false, url: `${SERVER}video/fanart/${recno}.${data.result[0].fanartStamp}`, file: null})
                        setDataChanged( () => false ); 

                        if( data.result[0].serie ){

                            videoApi.getEpisodes( recno, ( data ) => {

                                    for( let i = 0; i < data.result.length; i++ ){
                                        thumb.current[i]= { new: false, url: `${SERVER}video/ethumb/${recno}/${i}.${data.result[i].thumbStamp}`, file: null};
                                        epiDataChng.current[i]= { changed: false };
                                    } 
                                    setEdata( () => data );
                            }); 
                        }
                        busy.current = false;
                        //console.log("----------- data.result:\n",data.result,"\n----------\n")
                    }
            })
        )
        // ----------------------------------------------------------------------------------------    
        window.addEventListener( 'onbeforeunload', unLock );
        //window.addEventListener( 'unload', unLock );
        //document.addEventListener('visibilitychange', unLock );
        // ----------------------------------------------------------------------------------------
    } 
    return () => {
                   if( init ){ 
                       showMenu( true );

                       // unlock video record
                       unLock();
                      // ----------------------------------------------------------------------------------------
                      //document.removeEventListener( 'visibilitychange', unLock );
                      //window.removeEventListener( 'unload', unLock );
                      window.removeEventListener( 'onbeforeunload', unLock );
                      // ----------------------------------------------------------------------------------------
                   }    
                };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

/******************************************************************************************************
 *  save data
 */
const saveData = () => {

    
    const writeData = async () => {

        if( dataChanged ){

            const data = await videoApi.putOneASync( recno,  { ...vdata.result[0]  }, key.current );

            if ( !data.error ){
                setDataChanged( () => false );
                dataChanged = false;
            }
            else{
                setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
            }
            return data.error;
        }
        else
            return false;
    }
    const writePoster = async () => {

        if( poster.new ){
            
            const data = await videoApi.setPosterASync( recno, poster.file, key.current ) 
            
            if ( !data.error ){
                setPoster( prevPoster => ({ ...prevPoster, new: false, err: false }) );
                poster.new = false;
            }
            else{
                setPoster( prevPoster => ({ ...prevPoster, err: true }) );
                setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
            }
            return data.error;
        }
        return false;
    }
    const writeFanart = async () => {

        if( fanart.new ){
            
            const data = await videoApi.setFanartASync( recno, fanart.file, key.current ) 
            
            if ( !data.error ){
                setFanart( { ...fanart, new: false, err: false } );
                fanart.new = false;
            }
            else{
                setFanart( { ...fanart, err: true } );
                setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
            }
            return data.error;
        }
        return false;
    }
    const writeEpiThumbs = async () => {

        if( ()=> thumbChanged ){

            for( let i=0; i < thumb.current.length; i++ ){
            
                if( thumb.current[i].new ){
                    
                    const data = await videoApi.setEpiThumbASync( recno, i, thumb.current[i].file, key.current ) 
                    
                    if ( !data.error ){
                        thumb.current[i] =  { ...thumb.current[i], new: false, err: false } ;
                    }
                    else{
                        thumb.current[i] =  { ...thumb.current[i], err: true } ;
                        setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
                    }
                    return data.error;
                }
            }
        }
        return false;
    }
    const writeEpiData = async () => {

        if( ()=> epiDataChanged ){

            for( let i=0; i < epiDataChng.current.length; i++ ){
            
                if( epiDataChng.current[i].changed ){
                    
                    const data = await videoApi.setEpisodeASync( recno, i, key.current, edata.result[ i ].title, edata.result[ i ].plot ) 
                    
                    if ( !data.error ){
                        epiDataChng.current[i].changed = false;
                    }
                    else{
                        setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
                    }
                    return data.error;
                }
            }
            return false;
        }
    }

    writeData().then( err => writeEpiData() ).then( err => writePoster() ).then( err => writeFanart() ).then( err => writeEpiThumbs() ).then( err =>

        {   
            if( epiDataChanged ){       // check for non-written episode datas
                let epiNo = 0;
                for( ; epiNo < epiDataChng.current.length && !epiDataChng.current[ epiNo ].changed ; epiNo++ );
                if( epiNo === epiDataChng.current.length ){
                    setEpiDataChanged( () => false);
                    epiDataChanged = false;
                }
            }
            if( thumbChanged ){         // check for non-written episode thumbs
                let thumbNo = 0;
                for( ; thumbNo < thumb.current.length && !thumb.current[ thumbNo ].new ; thumbNo++ );
                if( thumbNo === thumb.current.length ){
                    setThumbChanged( () => false);
                    thumbChanged = false;
                }
            }
            // leave editor if anything written
            if( !dataChanged && !poster.new && !fanart.new && !thumbChanged && !epiDataChanged ){
                navigate( -1 );
            }
        }
    );
}

// =================================================================
if( !busy.current ){
    return (
        <div className="editor">

            <div id="editMenu">
                <div id="editTXT">Edit</div>
                <div id="navBUTTONS">
                    { ( dataChanged || poster.new || fanart.new || epiDataChanged || thumbChanged ) && 
                            <span id="saveButton" onClick={ () => saveData() }  alt="speichern">Speichern &&nbsp;beenden</span> }
                    <span id="abortButton" onClick={ () => navigate( -1 ) }>
                        Abbrechen
                    </span>        
                </div>
            </div>
            { lockMsg && <Message txt={ "Video wird gerade bearbeitet!" } func={ ()=> navigate(-1) }/> }  

                { !epiEdit ? 
            
                    <VideoEdit  vdata={vdata} 
                                poster={poster} 
                                setPoster={setPoster}
                                fanart={fanart}
                                setFanart={setFanart}
                                setDataChanged={setDataChanged}
                                setEpiEdit={setEpiEdit}
                    />
                :
                    <EpisodeEdit title={vdata.result[0].title}
                                 fanart={fanart}
                                 edata={edata} 
                                 epiDataChng={epiDataChng.current}
                                 setEpiDataChanged={setEpiDataChanged}
                                 setEpiEdit={setEpiEdit}
                                 thumb={thumb.current}
                                 setThumbChanged={setThumbChanged}
                    />
                }
            <RestoreWinScrollPos/>
            { vdata.error &&
                <Message txt={ vdata.errMsg } func={ ()=>setVdata( { ...vdata, error: false } ) }/> 
           }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}

export default Editor;
