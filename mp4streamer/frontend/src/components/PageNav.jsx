import React, { useState, useEffect } from "react";
import "./PageNav.css";


// =========== get characterwidth
const charWidth = ( txt ) => {

    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' );
  
    context.font = "bold 24px Arial";
    return context.measureText( txt ).width;
  }
  
const CHRWIDTH = Math.ceil( charWidth( "8" ) );

/********************************************************************************************
 * 
 */
function PageNav( {  page, lastPage, setPage, pageUp, pageDown } ) {


const [ init, setInit ] = useState( false );// Flag for component initialized

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    
    // install Handler for recording windows size
    if( init ){
        window.addEventListener( 'resize', winResizeHandler, { passive: true } );
    }
    // remove Handler 
    return () => {
        if( init ){
            window.removeEventListener( 'resize', winResizeHandler );
        }
    };
},[ init ]);

const [ winWidth, setWinWidth ] = useState({

    width: window.innerWidth,
});
const winResizeHandler = () => setWinWidth( { width: window.innerWidth } );

// =========================================================
const navMargin = 90;

const [navi, setNavi] = useState({

    len: 0,
    offset: 0,
    notStart: false,
    notEnd: false 
});

const pageNavWith = ( page, pages, margin ) =>{

    let len = 0;
    let testStr="« 1...  ..." + pages + " »";

    for(; testStr.length * CHRWIDTH < winWidth.width - margin *2; testStr += " " + page++, len++);

    return len
}

useEffect(() => {

    if( init ){

        let len = pageNavWith( page +1, lastPage +1, navMargin );
        let index = page % len;
        let offset =  page - index;

        if( offset + len > lastPage){
            offset -= offset + len - lastPage -1;
            if( offset < 0 ){
                offset = 0;
                len = lastPage+1;
            }  

        }    
        setNavi( {len: len, offset: offset, notStart: ( offset > 1 ), notEnd: ( (offset + len) < lastPage+1 ) } );

        //console.log("calc len=", len,"page=",page,"offset=",offset,"index=",index,"start=",(offset >= len),"end=",((offset + len) < (lastPage+1)));

    }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[init, winWidth]);

//--------------------------------------------------------------------------
return (
        
    <div className="pageNav">
        { lastPage > 0 &&
            <div>
                <button className="pageNavButton" onClick={ pageUp } disabled={ page === 0 && "disabled" }>&laquo;</button>   
                { navi.notStart && 
                  <button onClick={ () =>  setPage( 0 ) } 
                  className="firstPageButton"
                  >
                  {1}...
                  </button>
                }
                { [ ...Array( navi.len ) ].map( ( navPage, index ) => {

                        return (
                            <button onClick={ () =>  setPage( navi.offset + index ) } 
                                    key={ index } 
                                    className={ navi.offset + index === page ? "activePageButton" : "PageButton" }
                            >
                            { navi.offset + index +1 }
                            </button>
                        )
                    }) 

                }
                { navi.notEnd && 
                  <button onClick={ () =>  setPage( lastPage ) } 
                  className="lastPageButton"
                  >
                  ...{ lastPage+1 }
                  </button>
                }
                 <button className="pageNavButton" onClick={ pageDown } disabled={ page === lastPage && "disabled" }>&raquo;</button>   
           
            </div>    
        }
    </div>
);
}
export default PageNav;

