import React, { useState, useEffect, useRef, useContext } from "react";
import { Link  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import CharMenu from "../components/CharMenu.jsx";
import "./Index.css";
import "./CharTag.css";

const  back = { lastTab : "", scrollPos: 0, pos: 0, filter: "" };
//console.log("Tags init scrollpos=",back.scrollPos);

const scrollHandler = () => back.pos = window.scrollY;     //pageYOffset;

/********************************************************************************************
 * 
 */
function Index( { indextab, path, isname, title, searchadd = "" } ) {

const [ tags, setTags ] = useState( {
    
        error: false,
        result: []
} );

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const busy = useRef( true );
const sections = useRef([]);                    // Linktable to character sections


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
            back.lastTab = indextab;
        }
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

// Get tags 
useEffect( () => {

    if( init ){  

        busy.current = true;
        setTags( {...tags }, { result: [] } );


        videoApi.getIndexTab( indextab, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            busy.current = false;
                            setTags( () => data );
                            sections.current = data.result.map( ( entry, index) => { return( { char: entry.section, link: `SECT_${ index }` } ) } );
                        }
        }); 
        
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init, indextab ]);

useEffect(() => {

    if( init ){  
        if(indextab !== back.lastTab)
            back.scrollPos = 0;
        window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ tags.result ]);       

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


if( !busy.current ){
    return (
        <div className = "indexpage">
            { !tags.error ?
                <>
                    <CharMenu secTab = { sections.current } ></CharMenu> 
                    <h1><br></br>{title}</h1>
                    
                    {   tags.result.map( ( entry, index) => {

                            return (

                                <div key={ index } className="indexitems">

                                    <div id = { `SECT_${ index }` }><br></br></div>
                                    <div className = "chartag">{ entry.section }</div>

                                    {   entry.items.map( ( item, index ) => {

                                            if(isname) 
                                                return( <Link key = { index } to = { { pathname: `${ path }=*${ chngName( item ) }${ searchadd }` } }>{ item }</Link> )
                                            else
                                                return( <Link key = { index } to = { { pathname: `${ path }=*${ item }` } }>{ item }</Link> );
                                        })
                                    }

                                </div>
                            )
                        })
                    }
                </>
            : 
                <ModalWin>
                    <img src={ attention } alt="achtung" style={ { width: 70, margin: "auto" } } />
                    <div>
                        <p>
                                { tags.errMsg } 
                        </p>
                        <p><button onClick={ () => setTags( { error:false, result: [] } ) }>Ok</button></p>
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
export default Index;
