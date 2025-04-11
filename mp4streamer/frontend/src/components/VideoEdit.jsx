import React, { useRef, useState } from "react";
import Message from "../components/Message.jsx";
import "./VideoEdit.css";


function VideoEdit( { vdata, poster, setPoster, fanart, setFanart, setDataChanged, setEpiEdit }) {


    const fanartFileRef = useRef( null );       // reference filechooser fanart      
    const posterFileRef = useRef( null );       // reference filechooser poster    
    
    const [ picErr, setPicErr ] = useState( false );  
    const picErrMsg = useRef(""); 


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
     *  picError
     */
    const picError = ( fileName ) => {

        picErrMsg.current = `Die Datei: "${fileName}" ist zu groß! (max. 1MB)`
        setPicErr( () => true );
    }
    /******************************************************************************************************
     *  new Poster 
     */
    const posterChange = () => { 
        
        if( posterFileRef.current.files.length ){

            if( posterFileRef.current.files[0].size <= 1024 * 1024 )
                setPoster( { new: true, err: false, url: URL.createObjectURL( posterFileRef.current.files[0] ), file: posterFileRef.current.files[0] } );
            else{
                setPoster( { new: true,  err: true, url: URL.createObjectURL( posterFileRef.current.files[0] ), file: posterFileRef.current.files[0] } );
                picError(posterFileRef.current.files[0].name);
            }
        }
    }
    /******************************************************************************************************
     *  new Fanart 
     */
    const fanartChange = () => { 
        
        if( fanartFileRef.current.files.length ){

            if( fanartFileRef.current.files[0].size <= 1024 * 1024 )
                setFanart( { new: true, err: false, url: URL.createObjectURL( fanartFileRef.current.files[0] ), file: fanartFileRef.current.files[0] } );
            else{
                setFanart( { new: true, err: true, url: URL.createObjectURL( fanartFileRef.current.files[0] ), file: fanartFileRef.current.files[0] } );
                picError(fanartFileRef.current.files[0].name);
            }
        }
    }

return(

    <div id="videoEdit">
    
        <div id="background">
            <img src={ fanart.url } alt="..." onClick={ () => fanartFileRef.current.click()  }/> 
            <input type="file" accept="image/jpeg" style={{display: 'none'}} onChange={ fanartChange } ref={ fanartFileRef }/>
            <span id="fanartError" onClick={ () => fanartFileRef.current.click() } 
                  style={ {visibility: fanart.err ? 'visible' : 'hidden' } } >
            </span>
        </div>

        <div id="videoEditContainer">
            <div id="title">
                <input type="text" name="title" defaultValue={ cut( vdata.result[0].title ) } 
                            onChange={ changeHandler } placeholder="Filmtitel" 
                            className="titleInput"
                            autoFocus
                />
            </div>
            <img id="poster" src={ poster.url } alt="Poster" onClick={ ()=>posterFileRef.current.click() } /> 
            <input type="file" accept="image/jpeg" style={{display: 'none'}} onChange={ posterChange } ref={ posterFileRef }/>
            <span id="picError" onClick={ () => posterFileRef.current.click() } 
                  style={ {visibility: poster.err ? 'visible' : 'hidden' } } >
            </span>
            
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
            {vdata.result[0].serie &&
                <div  id="etoggl" >                      
                    <button onClick={ () => setEpiEdit( true ) }>Episoden</button>
                </div>
            }
            { picErr &&
                <Message txt={ picErrMsg.current } func={ ()=>setPicErr( () => false ) }/> 
            }    
        </div>
    </div>
);
}
export default VideoEdit; 