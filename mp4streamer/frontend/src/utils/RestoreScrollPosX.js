/********************************************************************************* 
 *  Browser Back-/forward button handling 
 */
let loaded = 0;

let idx = 0;             // history index
let browserJmp = false;  // flag for Browser back/forward

let yPos = 0;            // windows y-scrollposition
let rkey = "";           // history hash-key  

let stkPnt = 0;          // pointer in yPosition
const yPosition = [];    // stack for restoring y-scrollposition

let tmpPos = 0;          // temp-var to keep y-pos        

let pushWin = 0;         // counter for pushWinPos()-calls 
// ---------------------------------------------------------------------
// install handler


window.addEventListener( 'load', (event) => {
 
    if( loaded++ ) return;  

    window.addEventListener( 'scroll', (event) => yPos = window.scrollY );

    window.addEventListener( 'popstate', (event) => { browserJmp = true;
                                                      //console.log("BROWSER BACK <----", event.state);
                                                    });

    idx = window.history.state.idx;    // set history index
    
    // console.log(`init: rkey="${rkey}" ypos=${yPos} idx=${idx} STACK(${JSON.stringify(yPosition)}\n` );
});

export const pushWinPos = () => { if( !pushWin ) { tmpPos = yPos; pushWin++ }; }
export const restoreWinPos = () =>  { saveNewWinPos( tmpPos ); restoreWin(); pushWin = 0; }

// ---------------------------------------------------------------------
// save key & scrollposition
const saveNewWinPos = ( pos ) => { 

    if( !browserJmp ){
/*    
        console.log(`--------> pushWinPos()   ${JSON.stringify(window.history.state)}`)
        console.log(`rkey=${rkey} stkPnt=${stkPnt}`)
        console.log(`STACK:\n${JSON.stringify( yPosition.map((el,i)=>{return [i,el[0],el[1]];}))}\n`);
*/
        idx = window.history.state.idx;
        rkey = window.history.state.key;
    
        if( !yPosition.length ){
            yPosition.push( [ rkey, pos ] );
        }
        else{
            yPosition[ stkPnt++ ][ 1 ] = pos;
            if( stkPnt === yPosition.length )
                yPosition.push( [ rkey, 0 ] );
            else
                yPosition[stkPnt] = [ rkey, 0 ];
        }
    }
    else{
/*        
        console.log(`--------> pushWinPos() (BROWSERJMP!)  ${JSON.stringify(window.history.state)}`)
        console.log(`rkey=${rkey} stkPnt=${stkPnt}`)
        console.log(`STACK:\n${JSON.stringify( yPosition.map((el,i)=>{return [i,el[0],el[1]];}))}\n`);
*/
        yPosition[stkPnt][1] = pos;
    }    
/*
    console.log("--")
    console.log(`rkey=${rkey} stkPnt=${stkPnt}`)
    console.log(`STACK:\n${JSON.stringify( yPosition.map((el,i)=>{return [i,el[0],el[1]];}))}\n`);
*/
}  

// restore windows y-position 
const restoreWin = () =>  {

    if( browserJmp ){
        /*
        console.log(`--------> restoreWinPos()   ${JSON.stringify(window.history.state)}`)
        console.log(`rkey=${rkey} stkPnt=${stkPnt} idx=${idx}  history.idx=${window.history.state.idx}`)
        console.log(`STACK:\n${JSON.stringify( yPosition.map((el,i)=>{return [i,el[0],el[1]];}))}\n`);
        */
        rkey = window.history.state.key;
        let rpos;

        if( idx >= window.history.state.idx ){      

           // console.log("backward");

           // search backward
           for(rpos = stkPnt-1; rpos >= 0 && yPosition[ rpos ][ 0 ] !== rkey; 
            
            // console.log(`>rpos=${rpos}  rkey=${rkey} yPosition=${yPosition[ rpos ][ 0 ]}`),
            rpos-- ); 
        }
        else{
           // console.log("forward") 

           // search forward
           for(rpos = stkPnt+1; rpos < yPosition.length && yPosition[ rpos ][ 0 ] !== rkey; 
            
            // console.log(`>rpos=${rpos}  rkey=${rkey} yPosition=${yPosition[ rpos ][ 0 ]}`),
            rpos++ ); 
        }

        if( rpos >= 0 && rpos < yPosition.length ){

            // console.log(`--found:\nrpos=${rpos}  rkey=${rkey} yPosition=${yPosition[ rpos ][ 0 ]}`);

            if( yPosition[ rpos ][ 0 ] === rkey ){

                stkPnt = rpos;
                idx = window.history.state.idx;
                window.scrollTo( { top: yPosition[ stkPnt ][ 1 ] , behavior: 'auto' } );
            }    
        }
        idx = window.history.state.idx;
        browserJmp = false;
        /*
        console.log("--")
        console.log(`rkey=${rkey} stkPnt=${stkPnt} idx=${idx}  history.idx=${window.history.state.idx}`)
        console.log(`STACK:\n${JSON.stringify( yPosition.map((el,i)=>{return [i,el[0],el[1]];}))}\n`);
        */        
    }
    else {
        window.scrollTo( { top: 0, behavior: 'auto' } );
    }
}


