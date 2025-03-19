import React from "react";
import { Link } from "react-router-dom";
import "./VideoCard.css";
import { SERVER } from "../config.js";

const cut = ( txt ) => {

    txt = txt.replaceAll( "&apos;", "'" ).replaceAll( "&amp;", "&" );

    if( txt.includes( ' - ' ) ){

        return (<>
                <div className="title text">{
                    txt.substring( 0, txt.indexOf( ' - ' ) ).trim() }
               </div>
               <div className="text">{     
                    txt.substring( txt.indexOf( ' - ' )+2 ).replace( ' - ', '\n' ).trim() }
                    </div>
               </>)
    }

    return <p className="oneTitle text">{txt}</p>
}

function VideoCard( { video, star = false } ) {

return (

    <div className="card">
        <Link to={ { pathname: `/video/${video.recno} ` } }>
            <img src={ SERVER + `video/poster/${video.recno}.${video.posterStamp}` } alt="..."/>
            {cut( video.title )}
            { star && <div className="star"></div> } 
        </Link>
        
    </div>

  );
}

export default VideoCard;
