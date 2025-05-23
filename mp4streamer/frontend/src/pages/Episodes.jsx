import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { SERVER } from "../config.js";
import "./Episodes.css";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"

/********************************************************************************************
 * 
 */
const  back = { episodeNo: 0, recNo: -1 };

function Episodes() {

let { recno, title } = useParams( null, null );     

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const busy = useRef( true );
const [init, setInit] = useState(false);    // Flag for component initialized

const [ episodes, setEpisodes] = useState( {
    
                            error: false,
                            result: []
} );
const [ epiNo, setEpiNo] = useState( back.recNo === recno ? back.episodeNo : 0 );

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    if(init){

        //console.log("EPISODES enter")

        busy.current = true;
        setEpisodes( {...episodes }, { result: [] } );
        back.recNo = recno;
        videoApi.getEpisodes( recno, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            busy.current = false;
                            setEpisodes( () => data );
                        }
        }); 
    } 
    /*
    return () => {
        if( init ){
            console.log("EPISODES leave")
        }
    };
    */
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

// ==================================================================

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

if( !busy.current ){

    return (
        <div id="episodes">
 
            <div>
                { !episodes.error ?

                <>
                    <div id="background" >
                            <img src={`${SERVER}video/fanart/${recno}.${episodes.result[epiNo].fanartStamp}` } alt="..."/> 
                    </div>

                    <div id="episodesContainer">
                        <div id="title">
                        { cut( title ) }
                        </div>
                        <img id="thumb" src={`${SERVER}video/ethumb/${recno}/${epiNo}.${episodes.result[epiNo].thumbStamp}` } alt="..."/> 
                        <div id="plot">
                            { episodes.result[epiNo].plot }
                        </div>
                        <div id="epis">
                            <table>
                                <tbody>
                                    {  episodes.result.map( ( episode, index ) => {
                                            return (
                                                <tr key={index} >
                                                    <th  onClick={ () => { setEpiNo(index); back.episodeNo=index } }>{index+1})</th>
                                                    <td  onClick={ () => { setEpiNo(index); back.episodeNo=index } } 
                                                        className={epiNo === index ? 'active': ""}>
                                                        { episode.title }
                                                    </td>
                                                </tr>     
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                        <Link  id="player" to={ { pathname: `/player/${recno}/${epiNo} }` } }>
                            <button className="play">Episode {epiNo+1} ansehen</button>
                        </Link>
                    </div>
                    <RestoreWinScrollPos/>
                </>

                : 
                    <Message txt={ episodes.errMsg } func={ ()=>setEpisodes( { error:false, count: 0, result: [] } ) }/> 
                }    
            </div>    
        </div>
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}

export default Episodes;

