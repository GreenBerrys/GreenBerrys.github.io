import React, { useState, useEffect, useRef, useContext } from "react";
import videoApi from "../lib/videoApi";
import VideoCard from "../components/VideoCard";
import BusyIndicator from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
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
                    <h1> Die neuesten Videos:</h1>
                    {news.count === 0 &&
                        <h2><br></br><br></br>Keine neuen Videos gefunden..</h2>
                    }    
                    <div className="cardView">
                        {   news.result.map( ( video, index ) => {
                                return ( <VideoCard key = { index } video = { news.result[index] } /> );
                            })
                        }
                    </div>
                <RestoreWinScrollPos/>
                </div>
            : 
                <ModalWin>
                    <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                    <div>
                        <p>
                                { news.errMsg } 
                        </p>
                        <p><button onClick={ () => setNews( { error:false, count: 0, result: [] } ) }>Ok</button></p>
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
export default News;
