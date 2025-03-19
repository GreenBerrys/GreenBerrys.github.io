import React, { useState, useEffect } from "react";
import "./CharMenu.css";

/********************************************************************************************
 * 
 */
function CharMenu( {  secTab, vMap, fullpage } ) {

const [ init, setInit ] = useState( false );    // Flag for component initialized
const [ iLink, setILink ] = useState( 0 );      // 

//-- set flag for initialized
useEffect( () => { 
    if( !init) { setInit( () => true ); }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);   //[ secTab ]);

//-- Scroll to new position after char-section changed
useEffect( () => {
    
    if( init ){
        window.scrollTo( { top: window.scrollY + document.getElementById( `_${iLink}` ).getBoundingClientRect().top, behavior: 'auto' } );
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ iLink ]);

// ------------------------------------------------------------------------

//-- jump (scroll) to char-section
const jumpTo = ( e, link, index ) => {

    e.preventDefault();

    if( link === '_-1' ){  
        vMap( index ).then( setILink( () => index) ) // page not rendered - get page -->
    }
    else
        window.scrollTo( { top: window.scrollY + document.getElementById( link ).getBoundingClientRect().top, behavior: 'auto' } );
}

// ------------------------------------------------------------------------

return (
        <div>
            <div className="charmenu">
                {   
                    secTab.map( ( sect , index ) => {

                        return( <span key = { index } 
                                    onClick={ (e) => jumpTo( e, sect.link, index ) } 
                                    className={ sect.link !== '_-1' && !fullpage ?  "inside" : "outside" } 
                                >
                                { sect.char }
                                </span> );
                    })
                }
            </div>
        </div>
    );
}
export default CharMenu;

