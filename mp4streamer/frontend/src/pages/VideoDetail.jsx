import React, { useState, useEffect, useRef, useContext} from "react";
import { useParams, Link  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { SERVER } from "../config.js";
import "./VideoDetail.css";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";

/********************************************************************************************
 * 
 */
function VideoDetail() {

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

let { recno } = useParams( null );           // video recordnumber

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const busy = useRef( true );
const [ video, setVideo] = useState( {
    
                            error: false,
                            result: []
} );

const [ init, setInit ] = useState( false );// Flag for component initialized

// set flag for initialized
useEffect( () => {
   
    setInit( () => true );

},[]);

useEffect(() => {
    if( init ){
        window.scrollTo( { top: 0, behavior: 'auto' } );

        busy.current = true;
        setVideo( {...video }, { result: [] } );
        videoApi.getOne( recno, ( data ) => {

                    if (data.error && data.errMsg ===  "Access denied!" ){

                        // Back to start page when cookie has expired
                        setAuth( false ); 
                        sessionStorage.removeItem("User");
                        navigate( "/" );
                    }
                    else{
                        busy.current = false;
                        setVideo( () => data );
                    }
        }); 
    }    
    return () => {
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

// ==================================================================
const cut = ( txt ) => {

    txt = txt.replaceAll( "&apos;", "'" ).replaceAll( "&amp;", "&" );

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
const trans = ( txt ) => {

    return txt.replaceAll( '&quot;', '"' ).replaceAll( "&#x0A;", "\n" ).replaceAll( '&apos;', "'" ).replaceAll( "&#x0D;", "\n" );
}
const titleURLtrans = ( txt ) => {

    return txt.replaceAll( '/', '%2F' ).replaceAll( ':', '%3A' ).replaceAll( '"', '%22' )
              .replaceAll( '&', '%26' ).replaceAll( '+', '%2B' ).replaceAll( '?', '%3F' );
}

if( !busy.current ){
    return (
        <div id="videoDetail">
  
            <div >
                { !video.error ?

                <>
                    <div id="background" >
                        <img src={ `${SERVER}video/fanart/${video.result[0].recno}` } alt="..."/> 
                    </div>

                    <div id="videoDetailContainer">
                        <div id="title">
                        { cut( video.result[0].title ) }
                        </div>
                        <img id="poster" src={ `${SERVER}video/poster/${video.result[0].recno}` } alt="..."/> 
                        <div id="plot">
                            { trans( video.result[0].plot ) }
                        </div>
                        <div id="data">
                            <table>
                                <tbody>
                                    <tr>
                                        <th><b>
                                        {   
                                            <Link to={ { pathname: `/videos/directors` } }>Regie:</Link>
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
                                            <Link to={ { pathname: `/videos/genres` } }>Genre:</Link>
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
                                            <Link to={ { pathname: `/videos/tags` } }>Tag:</Link>
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
                </>

                : 
                    <ModalWin>
                        <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                        <div>
                            <p style={{color: 'red'}}>
                                { video.errMsg }
                            </p>
                            <p><button onClick={ () => setVideo( { error:false, count: 0, result: [] } ) }>Ok</button></p>
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

export default VideoDetail;

