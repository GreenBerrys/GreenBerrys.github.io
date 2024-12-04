import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import CharMenu from "../components/CharMenu.jsx";
import "./Actors.css";
import "./CharTag.css";

const  back = { scrollPos: 0, pos: 0, filter: "" };

const scrollHandler = () => back.pos = window.pageYOffset;

/********************************************************************************************
 * 
 */
function Actors() {

const [ actors, setActors ] = useState( {
    
        error: false,
        result: []
} );

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const pageEnd = useRef( 0 );                    // reference to the pageend (Position)
const busy = useRef( true );
const firstChar = useRef( "" );                 // First character in Name
const sections = useRef([]);                    // Linktable to character sections
const charMenuIsInit = useRef(false);           // Fixup for sections fill after href call  


// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

// Save last Window Y-Position
useEffect( () => {

    // install Handler for recording windows position
    if( init ){
        window.addEventListener( 'scroll', scrollHandler, { passive: true } );
    }
    // remove Handler and save windowsposition
    return () => {
        if( init ){
            window.removeEventListener( 'scroll', scrollHandler );
            back.scrollPos = back.pos;
        }
    };
},[ init ]);

// Get genres 
useEffect( () => {

    if( init ){  
        busy.current = true;
        setActors( {...actors }, { result: [] } );
        videoApi.getActors( ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            
                            busy.current = false;
                            setActors( () => data );
                        }
        }); 
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

useEffect(() => {

    if( init ){  

        window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ actors.result ]);   


/****************************************************************************
 * change name parts
 */
function chngName( parts ) {
    
    const name = parts.split(" ");

    if( name.length >  1 ){
        return name.slice( 1, name.length ).join(" ") + " " + name[ 0 ]; 
    }
    else{
        return name[0];
    }
}

const setChrMenuInit = (isInit) => charMenuIsInit.current = isInit;

/****************************************************************************
 * split new character 
 */
const entry = ( actor, index ) => {

    if( actor[0].toUpperCase() !== firstChar.current ){
       firstChar.current = actor[0].toUpperCase();

        if( !charMenuIsInit.current )
            sections.current.push( { char: firstChar.current, link: `SECT_${index}` } );

        return(
           <>
            <div id={`SECT_${index}`}><br></br></div>
            <div key={ index } className="chartag">{firstChar.current}</div>
            <Link key = { index } to={ { pathname: `/videos/plot=*${ chngName( actor ) + ":"}` } }>{ actor }</Link>
           </> 
        );
    }
    else{
        return (
            <Link key = { index } to={ { pathname: `/videos/plot=*${ chngName( actor ) + ":" }` } }>{ actor }</Link>
        );
    }
}

if( !busy.current ){
    return (
        <div className="actorpage">
            { !actors.error ?
                <div>
                    <CharMenu secTab={sections.current} setFlag={setChrMenuInit}></CharMenu>
                    <h1><br></br>Darsteller:</h1>

                    <div className="actors">
                        {   actors.result.map( ( actor, index ) => {
                                return( entry( actor, index ) )
                            })
                        }
                    </div>
                    <span ref={ pageEnd }></span>
                </div>
            : 
                <ModalWin>
                    <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                    <div>
                        <p>
                                { actors.errMsg } 
                        </p>
                        <p><button onClick={ () => setActors( { error:false, result: [] } ) }>Ok</button></p>
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
export default Actors;
