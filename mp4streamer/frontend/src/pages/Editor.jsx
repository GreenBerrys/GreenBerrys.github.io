import React, { useState, useEffect, useRef, useContext} from "react";
import { useParams, useNavigate } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
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

let [ dataChanged, setDataChanged ] = useState( false ); // Flag for Videodata changed

const fanartFileRef = useRef( null );       // reference filechooser fanart      
const posterFileRef = useRef( null );       // reference filechooser poster      
const picErrRef = useRef( null );           // reference PosterErrorpicture  
const fanartErrRef = useRef( null );           // reference FanartErrorpicture  

const [ vdata, setVdata ] = useState( {         // Videodata
    
                            error: false,
                            result: []
});

const [ poster, setPoster ] = useState( {       // Posterdata
    
    new: false,                                 // Flag for Poster changed
    url: ``,                                    // Poster URL for IMG-tag
    file: null                                  // File object
});
const [ fanart, setFanart ] = useState( {       // Fanartdata
    
    new: false,                                 // Flag for Fanart changed
    url: ``,                                    // Fanart URL for IMG-tag
    file: null                                  // File object
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
                        busy.current = false;
                        setVdata( () => data );
                        setPoster( {...poster, new: false, url: `${SERVER}video/poster/${recno}.${data.result[0].posterStamp}`, file: null})
                        setFanart( {...fanart, new: false, url: `${SERVER}video/fanart/${recno}.${data.result[0].posterStamp}`, file: null})
                        setDataChanged( () => false ); 

                        //    console.log("----------- data.result:\n",data.result,"\n----------\n")

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
 *  text decode
 */
const cut = ( txt ) => {

    txt = txt.replaceAll( "&apos;", "'" ).replaceAll( "&amp;", "&" );

    return txt;
}
/******************************************************************************************************
 *  inputhandling
 */
const changeHandler = ( event ) => {  vdata.result[ 0 ] = { ...vdata.result[ 0 ], [ event.target.name ]: event.target.value };  
                                      setDataChanged( () => true );  
                                   };

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
                picErrRef.current.style.visibility = "hidden";
                setPoster( prevPoster => ({ ...prevPoster, new: false }) );
                poster.new = false;
            }
            else{
                picErrRef.current.style.visibility = "visible";
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
                fanartErrRef.current.style.visibility = "hidden";
                setFanart( { ...fanart, new: false } );
                fanart.new = false;
            }
            else{
                fanartErrRef.current.style.visibility = "visible";
                setVdata( { ...vdata, error: data.error, errMsg: data.errMsg } );
            }
            return data.error;
        }
        return false;
    }
    
    writeData().then( err => writePoster() ).then( err => writeFanart() ).then( err =>

        {   if( !dataChanged && !poster.new && !fanart.new ){
                navigate( -1 );
            }
        }
    );
}
/******************************************************************************************************
 *  new Poster 
 */
const posterChange = () => { 
    
    if( posterFileRef.current.files.length ){

        picErrRef.current.style.visibility = "hidden" 
        setPoster( { new: true, url: URL.createObjectURL( posterFileRef.current.files[0] ), file: posterFileRef.current.files[0] } );
    }
}
/******************************************************************************************************
 *  new Fanart 
 */
const fanartChange = () => { 
    
    if( fanartFileRef.current.files.length ){

        //picErrRef.current.style.visibility = "hidden" 
        setFanart( { new: true, url: URL.createObjectURL( fanartFileRef.current.files[0] ), file: fanartFileRef.current.files[0] } );
    }
}

// =================================================================
if( !busy.current ){
    return (
        <div className="editor" onBeforeUnload >

            { lockMsg && <Message txt={ "Video wird gerade bearbeitet!" } func={ ()=> navigate(-1) }/> }  
            
            <div id="videoEdit">
            
                <div id="background">
                    <img src={ fanart.url } alt="..." onClick={ () => fanartFileRef.current.click()  }/> 
                    <span id="fanartError" onClick={ () => fanartFileRef.current.click() } ref={ fanartErrRef }></span>
                </div>

                <div id="editMenu">
                    <div id="editTXT">Edit</div>
                    <div id="navBUTTONS">
                        { ( dataChanged || poster.new || fanart.new ) && 
                                <span id="saveButton" onClick={ () => saveData() }  alt="speichern">Speichern&nbsp;&&nbsp;beenden</span> }
                        <span id="abortButton" onClick={ () => navigate( -1 ) }>
                            Abbrechen
                        </span>        
                    </div>
                </div>

                <div id="videoEditContainer">
                    <div id="title">
                        <input type="text" name="title" defaultValue={ cut( vdata.result[0].title ) } 
                                    onChange={ changeHandler } placeholder="Filmtitel" 
                                    className="titleInput"
                                    autoFocus
                        />
                    </div>

                    <input type="file" accept="image/jpeg" style={{display: 'none'}} onChange={ posterChange } ref={ posterFileRef }/>
                    <input type="file" accept="image/jpeg" style={{display: 'none'}} onChange={ fanartChange } ref={ fanartFileRef }/>
                    <img id="poster" src={ poster.url } alt="Poster" onClick={ ()=>posterFileRef.current.click() } /> 
                    <span id="picError" onClick={ () => posterFileRef.current.click() } ref={ picErrRef }></span>
                    
                    <div id="plot">
                        <textarea name="plot" defaultValue={ vdata.result[0].plot } 
                                onChange={changeHandler} placeholder="Handlung"
                                className="plotInput"
                        />
                    </div>
                    <div id="data">
                        <table>
                            <tbody>
                                <tr>
                                    <th><b>
                                        Regie:
                                    </b></th>        
                                    <td>
                                        <input type="text" name="director" defaultValue={ vdata.result[0].director } 
                                                onChange={ changeHandler } placeholder="Regisseur/in, Regisseur/in, ..." 
                                                className="directorInput"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th><b>Land:</b></th>
                                    <td>
                                        <input type="text" name="country" defaultValue={ vdata.result[0].country } 
                                                onChange={ changeHandler } placeholder="Land, Land, ..." 
                                                className="countryInput"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th><b>Jahr:</b></th>        
                                    <td>
                                        <input type="text" name="year" defaultValue={ vdata.result[0].year } 
                                                onChange={ changeHandler } placeholder="Jahr" 
                                                className="yearInput"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th><b>
                                        Genre:
                                    </b></th>        
                                    <td>
                                        <textarea type="text" name="genre" defaultValue={ vdata.result[0].genre } 
                                                onChange={ changeHandler } placeholder="Genre, Genre, ..." 
                                                className="genreInput" rows={3}
                                        />
                                    </td>
                                </tr>
                                <tr>                                        
                                    <th><b>
                                        Tag:
                                    </b></th>        
                                    <td>
                                        <textarea type="text" name="tag" defaultValue={ vdata.result[0].tag } 
                                                onChange={ changeHandler } placeholder="Tag, Tag, Tag, ..." 
                                                className="tagInput" rows={6}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
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
