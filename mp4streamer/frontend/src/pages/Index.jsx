import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useParams  } from "react-router-dom";
import videoApi from "../lib/videoApi.js";
import BusyIndicator from "../components/BusyIndicator.jsx";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import CharMenu from "../components/CharMenu.jsx";
import PhotoButton from "../components/PhotoButton.jsx";
import RestoreWinScrollPos from "../components/RestoreWinScrollPos.jsx"
import "./Index.css";
import "./CharTag.css";

const MAXSIZE = 6000;               // max entries in virtual page

// Tableparameter
const TAB = [];
TAB["genres"]    = { path: "/videos/genre", isname: false, title: "Genres:", searchadd: '', thumb: false };
TAB["tags"  ]    = { path: "/videos/tag", isname: false, title: "Tags:", searchadd: '', thumb: false };
TAB["directors"] = { path: "/videos/director", isname: true, title: "Regie:", searchadd: '', thumb: false };
TAB["actors" ]   = { path: "/videos/plot", isname: true, title: "Darsteller:", searchadd: ':', thumb: true };

// Last section in virtual page
const LASTSECT = []
LASTSECT["genres"   ] = 0;
LASTSECT["tags"     ] = 0;
LASTSECT["directors"] = 0;
LASTSECT["actors"   ] = 0;

let fotos = false;

/********************************************************************************************
 * 
 */
function Index() {

const navigate = useNavigate();
const { setAuth } = useContext( Context );
const { itable } = useParams( null );           // actual Index table (name)
const [ init, setInit ] = useState( false );    // Flag for component initialized

const [ index, setIndex ] = useState( {         // Full index
    
        error: false,
        result: []
} );

const busy = useRef( true );
const [photos, setPhotos] = useState(fotos);

//--------------------------
const sections = useRef([]);                     // Linktable to character sections
const renderTab = useRef([]);                    // Virtual index page for rendering
const fullPage = useRef(false);                  // Flag for index size <= MAXSIZE
 
const vPos = useRef( { start: -1, end: -1 } );   // Virtual page start/end section

const [ render, setRender ] = useState( false ); // Trigger for rerendering

//----------------------------------------------------------------------------------------

//-- set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

//-- Get index 
useEffect( () => {

    if( init ){  

        //console.log("INDEX enter")

        busy.current = true;

        setIndex( { error: false, result: [] } );

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

                // check table size
                const size = data.result.reduce( ( entries, section ) => entries + section.items.length, 0 );
                /*
                console.log(`Index "${itable}":\n`+
                            `${' '.repeat(6-String(size).length)+size} Entries\n`+
                            `${' '.repeat(6-String(data.result.length).length)+data.result.length} Sections\n`);
                */
                if( size <= MAXSIZE )
                    fullPage.current = true;
                else
                    fullPage.current = false;

                // intialize virtual page & character menü (sections)
                vMap( data.result, LASTSECT[ itable ] )
                    .then( result => { renderTab.current = result})
                    .then( sections.current = data.result.map( ( entry, index) => { 

                            return( { char: entry.section, link: `_${ index < vPos.current.start || index > vPos.current.end ? -1 : index }` } ) 
                            } )
                    )
            }
        }); 
        
    } 
    /*
    return () => {
        if( init ){
            tindex.current =  { error: false, result: [] };
            //console.log("INDEX leave");
        }
    };
    */
// eslint-disable-next-line react-hooks/exhaustive-deps
},[ init, itable ]);

//-- call vMap from CharMenu for render new section
const vMapSectSet = async ( xSectNo=0, dir=1 ) => { 

    vMap( index.result, xSectNo, dir )
        .then( result => renderTab.current = result )
        .then( sections.current = index.result.map( ( entry, index) => { 

            return( { char: entry.section, link: `_${ index < vPos.current.start || index > vPos.current.end ? -1 : index }` } ) 
            } )
        )
        .then( setRender( () => !render ) )  
}

//-- create table for virtual page
const vMap = async ( xTable, xSectNo , dir=1 ) => {

    let xStart = xSectNo; 
    let xEnd = xSectNo;
    let size = 0;  
    let result = [];

    if( dir ){   // down

        if( xStart > 0 )
            xStart--;

        for( ; xEnd < xTable.length && size < MAXSIZE; size += xTable[ xEnd++ ].items.length );
        for( ; xStart > 0 && size < MAXSIZE; size += xTable[ xStart-- ].items.length );
    }
    else{       // up

        if( xStart < xTable.length-1 )
            xStart++;
        
        for( ; xStart > 0 && size < MAXSIZE; size += xTable[ xStart-- ].items.length );
        for( ; xEnd < xTable.length && size < MAXSIZE; size += xTable[ xEnd++ ].items.length );
    }
    for( let i = xStart, ix=0;  i < xEnd ; result[ ix++ ] = [ xTable[ i ], i ], i++ );
        
    vPos.current = { start: xStart, end: xEnd-1 };
    //console.log(`vMap()  vPos=${JSON.stringify(vPos.current)} \nresult=\n${JSON.stringify(result.map((item) => {return [item[0].section, item[1]] } ))}`);

    LASTSECT[ itable ] = xSectNo;
    return result;
}

//-- change name parts
const chngName = ( parts ) => {

    if( !parts.length )
      console.log(`\nitable="${itable}" parts="${parts}"\n`)
    
    const name = String(parts).split(" ");

    if( name.length >  1 ){
        return name.slice( 1, name.length ).join(" ") + " " + name[ 0 ]; 
    }
    else{
        return name[0];
    }
}
// switch for PhotoButton
const setFotos = ( stat ) => { setPhotos( () => stat ); fotos = stat };   
//----------------------------------------------------------------------------------------

if( !busy.current ){
    return (
        <div className = "indexpage" >
            { !index.error ?
                <>
                    { itable === "actors"  && <PhotoButton setPhotos = { setFotos } photos = { photos }/> }
                    <CharMenu secTab = { sections.current } vMap = { vMapSectSet } fullpage = { fullPage.current } ></CharMenu> 
                     <h1><br></br>{TAB[ itable ].title}</h1> 
                    {  renderTab.current.map( ( entry, index ) => {
                            return (

                                <div key={ index } className="indexitems">
                                    <div id = { `_${ entry[ 1 ] }` }><br></br></div>
                                    <div className = "chartag">{ entry[ 0 ].section }</div>

                                    {   entry[ 0 ].items.map( ( item, index ) => {

                                            if(TAB[ itable ].isname){ 
                                                if( TAB[ itable ].thumb ){
                                                    if( item[1] === "" || !photos )
                                                        return( <Link key = { index } to = { { pathname: `${ TAB[ itable ].path }=*${ chngName( item[0] ) }${ TAB[ itable ].searchadd }` } }>{ item[0] }</Link> )
                                                    else{
                                                        return( 
                                                                <Link key = { index }
                                                                      to = { { pathname: `${ TAB[ itable ].path }=*${ chngName( item[0] ) }${ TAB[ itable ].searchadd }` } }
                                                                >
                                                                { item[0] }
                                                                <span className="thumb" style={ { backgroundImage: `url(${item[1]})` } }></span>
                                                                </Link> 
                                                            )
                                                    }    
                                                }
                                                else{
                                                    return( <Link key = { index } to = { { pathname: `${ TAB[ itable ].path }=*${ chngName( item ) }${ TAB[ itable ].searchadd }` } }>{ item }</Link> )
                                                }
                                            }
                                            else{
                                                return( <Link key = { index } to = { { pathname: `${ TAB[ itable ].path }=*${ item }` } }>{ item }</Link> );
                                            }    
                                        })
                                    }

                                </div>
                            )
                        })
                    }
                    <div style={ { height: "300px" } }></div>
                    <RestoreWinScrollPos/>
                </>
            : 
                <Message txt={ index.errMsg } func={ () => setIndex( {...index }, { error: false, result: [] } ) } /> 
            }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}
export default Index;
