import React, { useState } from "react";
import "./PhotoButton.css";

/********************************************************************************************
 * 
 */
function PhotoButton( {  setPhotos, photos } ) {

    const [ toggle, setToggle ] = useState( photos );

    const setToggles = () => { setToggle( () => !toggle ); setPhotos( !photos ) }

    return ( <div className="picbutton" onClick={ () => setToggles() }>{ toggle ? "Fotos an" : "Fotos aus" }</div> );
}
export default PhotoButton;

