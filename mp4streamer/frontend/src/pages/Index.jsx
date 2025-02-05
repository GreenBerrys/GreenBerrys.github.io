import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useParams  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import CharMenu from "../components/CharMenu.jsx";
import { pushWinPos, restoreWinPos } from "../utils/RestoreScrollPosX.js"
import "./Index.css";
import "./CharTag.css";

// Tableparameter
const TAB = [];
TAB["genres"]    = { path: "/videos/genre", isname: false, title: "Genres:", searchadd: '' };
TAB["tags"  ]    = { path: "/videos/tag", isname: false, title: "Tags:", searchadd: '' };
TAB["directors"] = { path: "/videos/director", isname: true, title: "Regie:", searchadd: '' };
TAB["actors" ]   = { path: "/videos/plot", isname: true, title: "Darsteller:", searchadd: ':' };

/********************************************************************************************
 * 
 */
function Index() {

const [ index, setIndex ] = useState( {
    
        error: false,
        result: []
} );
const { itable } = useParams( null );

const { setAuth } = useContext( Context );
const navigate = useNavigate();

const [ init, setInit ] = useState( false );    // Flag for component initialized
const busy = useRef( true );
const sections = useRef([]);                    // Linktable to character sections

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect( () => {

    // init
    if( init ){

        //console.log("INDEX enter")

    }
    // cleanup
    return () => {
        if( init ){
            //console.log("INDEX leave")
            // keep window y-scrollposition - before loading new content! 
            pushWinPos();  
        }
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init ]);

// Get index 
useEffect( () => {

    if( init ){  

        // keep window y-scrollposition - before loading new content! 

        //console.log(`INDEX '${itable}' <===================`);
        pushWinPos();  

        busy.current = true;
        setIndex( {...index }, { result: [] } );

        videoApi.getIndexTab( itable, ( data ) => {

                        if (data.error && data.errMsg ===  "Access denied!" ){

                            // Back to start page when cookie has expired
                            setAuth( false ); 
                            sessionStorage.removeItem("User");
                            navigate( "/" );
                        }
                        else{
                            busy.current = false;
                            setIndex( () => data );
                            sections.current = data.result.map( ( entry, index) => { return( { char: entry.section, link: `_${ index }` } ) } );
                        }
        }); 
        
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init, itable ]);

// save new or restore old window y-scrollposition
// if browser back-/forward button clicked 
useEffect(() => {

    if( init ) 
        restoreWinPos(); 

// eslint-disable-next-line react-hooks/exhaustive-deps
},[ index.result  ]);       

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
            { !index.error ?
                <>
                    <CharMenu secTab = { sections.current } ></CharMenu> 
                    <h1><br></br>{TAB[ itable ].title}</h1>
                    
                    {   index.result.map( ( entry, index) => {

                            return (

                                <div key={ index } className="indexitems">

                                    <div id = { `_${ index }` }><br></br></div>
                                    <div className = "chartag">{ entry.section }</div>

                                    {   entry.items.map( ( item, index ) => {

                                            if(TAB[ itable ].isname) 
                                                return( <Link key = { index } to = { { pathname: `${ TAB[ itable ].path }=*${ chngName( item ) }${ TAB[ itable ].searchadd }` } }>{ item }</Link> )
                                            else
                                                return( <Link key = { index } to = { { pathname: `${ TAB[ itable ].path }=*${ item }` } }>{ item }</Link> );
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
                                { index.errMsg } 
                        </p>
                        <p><button onClick={ () => setIndex( { error:false, result: [] } ) }>Ok</button></p>
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
