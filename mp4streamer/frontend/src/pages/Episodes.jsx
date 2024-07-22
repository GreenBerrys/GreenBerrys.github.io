import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { SERVER } from "../config.js";
import "./Episodes.css";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";


/********************************************************************************************
 * 
 */
const  back = { episodeNo: 0, recNo: -1 };

function SerieDetail() {

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

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
        window.scrollTo( { top: 0, behavior: 'auto' } );

        busy.current = true;
        setEpisodes( {...episodes }, { result: [] } );
        back.recNo = recno;
        videoApi.getEpisodes( recno, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            navigate( "/" );
                            sessionStorage.removeItem("User");
                        }
                        else{
                            busy.current = false;
                            setEpisodes( () => data );
                        }
        }); 
    }    
    return () => {
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

// ==================================================================
const cut = (txt) => {

    txt = txt.replaceAll( "&apos;", "'" ).replaceAll( "&amp;", "&" );

    if( txt.includes( ' - ' ) ){

        return (<>
                <div className="title">{
                    txt.substring( 0, txt.indexOf( ' - ' ) ).trim() }
               </div>
               <div className="titleText">{ 
                    txt.substring( txt.indexOf( ' - ' )+2 ).replaceAll( '-' , '\n' ).trim() }
               </div>
               </>)
    }

    return <p className="oneTitle text">{txt}</p>
}
const trans = ( txt ) => {

    return txt.replaceAll( '&quot;', '"' ).replaceAll( "&#x0A;", "" ).replaceAll( '&apos;', "'" ).replaceAll( "&#x0D;", "\n" );
}

if( !busy.current ){

    return (
        <div id="episodes">
 
            <div>
                { !episodes.error ?

                <>
                    <div id="background" >
                            <img src={`${SERVER}video/fanart/${recno}` } alt="..."/> 
                    </div>

                    <div id="episodesContainer">
                        <div id="title">
                        { cut( title ) }
                        </div>
                        <img id="thumb" src={`${SERVER}video/ethumb/${recno}/${epiNo}` } alt="..."/> 
                        <div id="plot">
                            { trans( episodes.result[epiNo].plot ) }
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
                                                        {trans(episode.title)}
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
                </>

                : 
                    <ModalWin>
                        <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                        <div>
                            <p>
                                { episodes.errMsg }
                            </p>
                            <p><button onClick={ () => setEpisodes( { error:false, count: 0, result: [] } ) }>Ok</button></p>
                        </div>
                    </ModalWin>   
                    
                }    
            </div>    
        </div>
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}

export default SerieDetail;

