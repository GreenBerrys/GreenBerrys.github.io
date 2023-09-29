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
                    txt.substring( txt.indexOf( ' - ' )+2 ).replaceAll( '-', '\n' ).trim() }
               </div>
               </>)
    }

    return <p className="oneTitle text">{txt}</p>
}

function VideoCard( { video } ) {

return (

    <div className="card">
       
        <Link to={ { pathname: `/video/${video.recno} ` } }>
            <img src={ SERVER + `video/poster/${video.recno}` } alt="..."/>
            {cut( video.title )}
        </Link>
    </div>

  );
}

export default VideoCard;
