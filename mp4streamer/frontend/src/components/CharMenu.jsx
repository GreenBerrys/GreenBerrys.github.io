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

// jump (scroll) to char-section
const jumpTo = ( e, link ) => {

    e.preventDefault();
    window.scrollTo( { top: window.scrollY + document.getElementById( link ).getBoundingClientRect().top, behavior: 'auto' } );
}

return (
    
        <div className="charmenu" >
            {   
                secTab.map( ( sect , index ) => {

                    return( <span key = { index } onClick={ (e) => jumpTo( e, sect.link) } >{ sect.char }</span> );
                })
        }
        </div>
);
}
export default CharMenu;

