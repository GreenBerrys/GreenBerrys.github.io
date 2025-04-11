import React, { useRef, useState } from "react";
import Message from "../components/Message.jsx";
import "./EpisodeEdit.css";

let lastEpiNo = 0;

function EpisodeEdit( { title, fanart, edata, epiDataChng, setEpiDataChanged, setEpiEdit, thumb, setThumbChanged }) {

    const epiPlot = useRef( null );
    const thumbFileRef = useRef( null );

    const [ epiNo, setEpiNo] = useState( lastEpiNo < edata.result.length ? lastEpiNo : 0 );
    const [ render, setRender ] = useState( false );

    const [ picErr, setPicErr ] = useState( false );  
    const picErrMsg = useRef(""); 
    

    /******************************************************************************************************
     *  setEpi
     */
    const setEpi = ( no ) => {

        setEpiNo( no );
        epiPlot.current.value = edata.result[ no ].plot;
        lastEpiNo = no;
    } 
    /******************************************************************************************************
     *  text decode
     */
    const cut = (txt) => {

        if( txt.includes( ' - ' ) ){
    
            return (<>
                    <div className="title">{
                        txt.substring( 0, txt.indexOf( ' - ' ) ).trim() }
                   </div>
                   <div className="titleText">{ 
                        txt.substring( txt.indexOf( ' - ' )+2 ).replace( ' - ' , '\n' ).trim() }
                   </div>
                   </>)
        }
    
        return <p className="oneTitle text">{txt}</p>
    }
    /******************************************************************************************************
     *  ChangeHandler  inputhandling plot / title
     */
    const ChangeHandler = ( event ) => { 
        
        edata.result[ epiNo ] = { ...edata.result[ epiNo ], [ event.target.name ]: event.target.value };
        epiDataChng[ epiNo ].changed = true;
        setEpiDataChanged( true );
    };
    /*
    /******************************************************************************************************
     *  picError
     */
    const picError = ( fileName ) => {

        picErrMsg.current = `Die Datei: "${fileName}" ist zu groß! (max. 1MB)`
        setPicErr( () => true );
    }
    /******************************************************************************************************
     *  new thumb 
     */
    
    const thumbChange = () => { 

        if( thumbFileRef.current.files.length ){

            if( thumbFileRef.current.files[0].size <= 1024 * 1024 ){
                thumb[ epiNo ] = { new: true, err: false, url: URL.createObjectURL( thumbFileRef.current.files[0] ), file: thumbFileRef.current.files[0] };
                setRender( () => !render );
                setThumbChanged( true );
            }
            else{
                thumb[ epiNo ] = { new: true, err: true, url: URL.createObjectURL( thumbFileRef.current.files[0] ), file: thumbFileRef.current.files[0] };
                picError(thumbFileRef.current.files[0].name);
                setRender( () => !render );
                setThumbChanged( true );
            }
        }
    }
        
return(
        <div id="episodeEdit">
 
                <div id="background">
                    <img src={ fanart.url } alt="..." /> 
                    <span id="fanartError" style={ {visibility: fanart.err ? 'visible' : 'hidden' } } ></span>
                </div>

                <div id="episodesContainer">
                    <div id="title">
                    { cut( title ) }
                    </div>

                    <img id="thumb" src={ thumb[epiNo].url } alt="Poster" onClick={ ()=>thumbFileRef.current.click() } /> 
                    <input type="file" accept="image/jpeg" style={{display: 'none'}} onChange={ thumbChange } ref={ thumbFileRef }/>
                    <span id="picError" onClick={ () => thumbFileRef.current.click() } 
                          style={ {visibility: thumb[epiNo].err ? 'visible' : 'hidden' } } >
                    </span>
                     <div id="eplot">
                        <textarea name="plot" defaultValue={ edata.result[epiNo].plot } 
                                onChange={ChangeHandler} placeholder="Handlung"
                                className="eplotInput"
                                ref={epiPlot}
                        />
                    </div>
                    <div id="epis">
                        <table>
                            <tbody>
                                {  edata.result.map( ( episode, index ) => {
                                        return (
                                            <tr key={index} className={epiNo === index ? 'active': ""}>
                                                <th  onClick={ () => setEpi(index) }>{index+1})</th>
                                                <td >
                                                    <input type="text" name="title" defaultValue={ episode.title } 
                                                        onChange={ ChangeHandler } placeholder="Episodentitel" 
                                                        className={epiNo === index ? 'active': ""}
                                                        onFocus={ () => setEpi(index) }
                                                    />
                                                </td>
                                            </tr>     
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div  id="etoggl" >                      
                        <button onClick={ () => setEpiEdit( false ) }>Serie</button>
                    </div>
                    { picErr &&
                        <Message txt={ picErrMsg.current } func={ ()=>setPicErr( () => false ) }/> 
                    }    
                </div>

        </div>
);
}
export default EpisodeEdit; 