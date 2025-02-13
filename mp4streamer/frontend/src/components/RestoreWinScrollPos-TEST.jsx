import { useState, useEffect } from "react";
/********************************************************************************* 
 *  Browser Back-/forward button handling 
 */

let idx = 0;             // history index
let browserJmp = false;  // flag for Browser back/forward

let yPos = 0;            // windows y-scrollposition
let rkey = "not init";   // history hash-key  

let stkPnt = 0;          // pointer in yPosition
const yPosition = [];    // stack with hashs and y-scrollpositions

let bdx = 0;             // copy from window.state.idx for start/stop y-scrollposition recording
// ---------------------------------------------------------------------
// install handler

let modulInit = false;

window.addEventListener( 'load', ( event ) => {

    window.addEventListener( 'scroll', ( event ) => { if( bdx === window.history.state.idx) yPos = window.scrollY; } );
    window.addEventListener( 'popstate', ( event ) => browserJmp = true );

    // initialize variables
    idx = window.history.state.idx;    
    bdx = window.history.state.idx;
    rkey = window.history.state.key;
    yPosition.push( [ rkey, 0, window.location.pathname ] );
    stkPnt = 0;

    modulInit = true;

    stkPrint(`\n=======================\n--INIT  state ( ${ JSON.stringify( window.history.state ) } )\n====================\n`);

});
// ===============================================================================
// React componente

export default function RestoreWinScrollPos(){

    const [init, setInit] = useState(false);    // Flag for component initialized

    // set flag for initialized
    useEffect( () => {
        setInit( () => true );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(() => {

        if( init && modulInit ) restoreWinPos(); 
        
        return () => { if( init && modulInit ) pushWinPos(); };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[init]);

    return;
}
// ===============================================================================

// ---------------------------------------------------------------------
// save key & scrollposition
const pushWinPos = () => { 

    //stkPrint(`=======> PUSHWINPOS() enter `);

    yPosition[ stkPnt ][ 1 ] = yPos;

    if( idx < window.history.state.idx ){

        stkPnt++;

        if( stkPnt === yPosition.length )
            yPosition.push( [ window.history.state.key, 0, window.location.pathname ] );
        else if( yPosition[stkPnt][0] !== window.history.state.key )   
            yPosition[ stkPnt ] = [ window.history.state.key, 0, window.location.pathname ];
    }
    bdx = window.history.state.idx;

    stkPrint(`--PUSHWINPOS() leave `);
}  
// ---------------------------------------------------------------------
// restore windows y-position 
const restoreWinPos = () =>  {

    rkey = window.history.state.key;
    bdx = window.history.state.idx;

    let rstkPnt = stkPnt;

    //stkPrint(`=======> RESTOREWINPOS() enter`);    

    if( browserJmp ){

        if( idx >= window.history.state.idx ){      

            console.log("BACKWARD");

            // search backward
            for(; rstkPnt >= 0 && yPosition[ rstkPnt ][ 0 ] !== rkey; rstkPnt-- ); 
        }
        else{
            console.log("FORWARD") 

            // search forward
            for(; rstkPnt < yPosition.length && yPosition[ rstkPnt ][ 0 ] !== rkey;  rstkPnt++ ); 
        }

        if( rstkPnt >= 0 && rstkPnt < yPosition.length ){

            if( yPosition[ rstkPnt ][ 0 ] === rkey ){

                stkPnt = rstkPnt;
                window.scrollTo( { top: yPosition[ stkPnt ][ 1 ] , behavior: 'auto' } );
            }    
        }
        else{
            if( rstkPnt === -1 ){

                console.log(`-- NOT FOUND: stkPnt=${stkPnt}  yPosition[${stkPnt}]=${yPosition[stkPnt]}`)

                stkPnt = 0;
                rkey = window.history.state.key
                yPosition[ stkPnt ] = [ rkey, 0, window.location.pathname ];
                yPos = 0; 
                //window.history.forward();                 
            }
        }
    }
    else {
        window.scrollTo( { top: 0, behavior: 'auto' } );
    }

    idx = window.history.state.idx;
    browserJmp = false;

    stkPrint(`--RESTOREWINPOS() leave`);
}
// -------------------------------------for testing only--------------------------------------------------
const stkPrint = (title="") => {

    const fmt = (str) => " ".repeat( 6 - String(str).length ) + str;  

console.log( `--> state: ${JSON.stringify( window.history.state )}` );    

console.log( title + `\nstkPnt=${stkPnt} rkey="${rkey}" yPosition[${stkPnt}]=[${yPosition[stkPnt][0]},${yPosition[stkPnt][1]}]\n` )
yPosition.forEach( (el,i) => { console.log( (i === stkPnt ? "-> " : "   ") + i + `: [ ${el[0]}, ${fmt(el[1])}, ${el[2]} ]`) } );

}


