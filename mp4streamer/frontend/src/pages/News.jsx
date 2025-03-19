import React, { useState, useEffect, useRef, useContext } from "react";
import videoApi from "../lib/videoApi";
import VideoCard from "../components/VideoCard";
import BusyIndicator from "../components/BusyIndicator.jsx";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import "./News.css";

/********************************************************************************************
 * 
 */
function News() {

const [ news, setNews ] = useState( {
    
                            error: false,
                            page: -1,
                            lastPage: -1,
                            count: 0,
                            result: []
} );


const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const busy = useRef( true );

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

// Get news 
useEffect( () => {

    if( init ){  

        //console.log("NEWS enter");

        busy.current = true;
        setNews( {...news }, { result: [] } );
        videoApi.getNews( ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            
                            busy.current = false;
                            setNews( () => data );
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
},[ init ]);

// ==================================================================

if( !busy.current ){
    return (
        <div>
            { !news.error ?
                <div>
                    <h1> Neueste Videos:</h1>
                    {news.count === 0 &&
                        <h2><br></br><br></br>Keine Videos gefunden..</h2>
                    }    
                    <div className="cardView">
                        {   
                            news.result.map( ( video, index ) => {
                                
                                return ( <VideoCard key = { index } video = { video } star = { ( video.mtimeMs - video.btimeMs ) < 1728000000 } /> );
                            })
                        }
                    </div>
                    <RestoreWinScrollPos/>
                </div>
            : 
                 <Message txt={ news.errMsg } func={ ()=>setNews( { error:false, count: 0, result: [] } ) }/> 
            }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}
export default News;
