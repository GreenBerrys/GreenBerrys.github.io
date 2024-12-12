import React, { useState, useEffect } from "react";
import "./CharMenu.css";

/********************************************************************************************
 * 
 */
function CharMenu( {  secTab } ) {

const [ init, setInit ] = useState( false );    // Flag for component initialized

// set flag for initialized
useEffect( () => {
    
    if( !init) {
        setInit( () => true );
    }        
    

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ secTab ]);

return (
    
        <div className="charmenu" >
            {   
                secTab.map( ( sect , index ) => {

                    return( <a key = { index } href={`#${sect.link}`}  >{ sect.char }</a> );
                })
        }
        </div>
);
}
export default CharMenu;

