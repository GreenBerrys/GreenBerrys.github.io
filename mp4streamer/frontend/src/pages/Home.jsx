import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Context from "../AppContext.js";
import videoApi from "../lib/videoApi";
import { SERVER } from "../config.js";
import bvid from '../Images/BackgroundVideo.mp4'; 
import './Home.css';


// ================================================================================

function Home() {

const navigate = useNavigate();
const { auth } = useContext( Context );
const [ init, setInit ] = useState( false );// Flag for component initialized

const [ news, setNews ] = useState( {
    
                            error: false,
                            page: -1,
                            lastPage: -1,
                            count: 0,
                            result: []
} );

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);


useEffect( () => {
    if( init ){
        if( auth ){
            navigate("/videos/*",{ replace: true });  
        }
        else{
            videoApi.getNews( ( data ) => setNews( () => data ));
        }
        window.scrollTo( { top: 0, behavior: 'auto' } );
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

const noContext = ( event ) =>{     // surpress context-menu    

    event.preventDefault();
    return false;
}

return (
    <div>
        <div>
            <video id="bvid" onContextMenu={ noContext } autoPlay loop muted playsInline>
                    <source src={bvid} type='video/mp4' />
            </video>
        </div>
        <div id="welcome">
            <div id="w1">mp4streamer-Bibliothek</div>
            <div id="w2">Bitte melde dich an</div>
        </div> 
        <div className="Poster">
            <div className="Posterscroll">
                <div style={{height: "600px"}}></div>
                {
                    news.result.map( ( video, index ) => {
                        return (
                                <div key={index}>
                                    <img src={ SERVER + `video/poster/${ video.recno }.${ video.posterStamp }` } alt="..." ></img>
                                    <h2>{video.title}<br></br><br></br><br></br></h2>
                                </div>
                                
                        )
                    })
                }
            </div>
        </div>
    </div>

  );
}

export default Home;

