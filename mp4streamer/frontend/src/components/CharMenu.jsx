import React, { useState, useEffect, useRef } from "react";
import "./CharMenu.css";
import { Link } from "react-router-dom";

/********************************************************************************************
 * 
 */
function CharMenu( {  secTab, setFlag } ) {

const [ init, setInit ] = useState( false );    // Flag for component initialized
const sections = useRef([]);                    // Linktable to character sections


// set flag for initialized
useEffect( () => {
    
    if( !init) {
        sections.current = secTab;
        setFlag( true );
    }        
    
    setInit( () => true );
},[]);

return (
    <div className="charmenu" >
        {/* <div className="head"></div> */}
        {   sections.current.map( ( sect , index ) => {

                return( <a key = { index } href={`#${sect.link}`}  >{ sect.char }</a> );


            })
      }
    </div>
);
}
export default CharMenu;

