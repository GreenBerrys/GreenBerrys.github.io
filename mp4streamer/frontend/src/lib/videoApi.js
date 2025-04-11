/******************************************************************************************
 * 
 * VIDEO API
 * 
 */
 import { SERVER } from "../config.js";

//function sleep( time ) { return new Promise( ( resolve ) => setTimeout( resolve, time ) ); }

/*********************************************************************
 *  putOne() - write videodata
 *********************************************************************/
async function putOneASync( recno, vdata, vkey ){

    //console.log(`VideoApi putOneASync()\n${JSON.stringify(vdata)}`);

    try{
        const response = await fetch( 
            
                SERVER + 'video/detail/' + recno, {
                method: 'POST', 
                mode:"cors",
                headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify( { key: vkey, data: vdata } )
        });
        return await response.json();
    }
    catch( error ){
        //console.error('setLockSync() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    }
}
function putOne( recno, vdata, vkey, setter  ){

    //console.log(`VideoApi putOne()\n${JSON.stringify(vdata)}`);

    return fetch( SERVER + 'video/detail/' + recno, {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( { key: vkey, data: vdata } )
    })
    .then(response => response.json())
    .then(data => {
        setter( data );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  setEpisodeASync() - upload episode data
 *********************************************************************/
async function setEpisodeASync( recno, epiNo, vkey, etitle, eplot ){

    //console.log(`VideoApi setEpisodeASync()`);

    try{
        const response = await fetch( 
            
                SERVER + 'video/episode/' + recno + '/' + epiNo, {
                method: 'POST', 
                mode:"cors",
                headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                },
                body: JSON.stringify( { key: vkey, title: etitle, plot: eplot } )
        });
        return await response.json();
    }
    catch( error ){
        //console.error('setEpisodeASync() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    }
}
/*********************************************************************
 *  setEpiThumbASync() - upload episode thumb
 *********************************************************************/
async function setEpiThumbASync( recno, epiNo, thumb, vkey ){

    //console.log(`VideoApi setEpiThumbASync()`);

    const formData = new FormData();
    const timeStamp = Date.now();

    formData.append( 'thumbStamp', timeStamp );
    formData.append( 'key', vkey );
    formData.append( 'thumb', thumb );

    try{
        const response = await fetch( 
            
                    SERVER + 'video/ethumb/' + recno + '/' + epiNo + '.' + timeStamp , {
                    method: 'POST', 
                    mode:"cors",
                    headers: {
                    'Accept': 'application/json'
                    },
                    body: formData
        });
        return await response.json();                        
    }
    catch( error ){
        return( { error: true, errMsg: error, result: [] } );
    }
}
/*********************************************************************
 *  setPoster() - upload Poster
 *********************************************************************/
async function setPosterASync( recno, poster, vkey ){

    //console.log(`VideoApi setPosterASync()`);

    const formData = new FormData();
    const timeStamp = Date.now();

    formData.append( 'posterStamp', timeStamp );
    formData.append( 'key', vkey );
    formData.append( 'poster', poster );

    try{
        const response = await fetch( 
            
                    SERVER + 'video/poster/' + recno + '.' + timeStamp , {
                    method: 'POST', 
                    mode:"cors",
                    headers: {
                    'Accept': 'application/json'
                    },
                    body: formData
        });
        return await response.json();                        
    }
    catch( error ){
        return( { error: true, errMsg: error, result: [] } );
    }
}
function setPoster( recno, poster, vkey, setter ){

    //console.log(`VideoApi setPoster()`);

    const formData = new FormData();
    const timeStamp = Date.now();

    formData.append( 'posterStamp', timeStamp );
    formData.append( 'key', vkey );
    formData.append( 'poster', poster );

    return fetch( SERVER + 'video/poster/' + recno + '.' + timeStamp , {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        setter( data );
    })
    .catch((error) => {
        console.error('setPoster() Error:', error.message);
    });
}
/*********************************************************************
 *  setFanart() - upload Fanart
 *********************************************************************/
async function setFanartASync( recno, fanart, vkey ){

    //console.log(`VideoApi setPosterASync()`);

    const formData = new FormData();
    const timeStamp = Date.now();

    formData.append( 'fanartStamp', timeStamp );
    formData.append( 'key', vkey );
    formData.append( 'fanart', fanart );

    try{
        const response = await fetch( 
            
                    SERVER + 'video/fanart/' + recno + '.' + timeStamp , {
                    method: 'POST', 
                    mode:"cors",
                    headers: {
                    'Accept': 'application/json'
                    },
                    body: formData
        });
        return await response.json();                        
    }
    catch( error ){
        return( { error: true, errMsg: error, result: [] } );
    }
}
function setFanart( recno, fanart, vkey, setter ){

    //console.log(`VideoApi setFanart()`);

    const formData = new FormData();
    const timeStamp = Date.now();

    formData.append( 'fanartStamp', timeStamp );
    formData.append( 'key', vkey );
    formData.append( 'fanart', fanart );


    return fetch( SERVER + 'video/fanart/' + recno + '.' + timeStamp , {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Accept': 'application/json'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        setter( data );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

/*********************************************************************
 *  getIndexTab() - get Index table
 **********************************************************************/
function getIndexTab( tab, setter ){

    //console.log(`VideoApi getIndexTab(${tab})`);

    return fetch( SERVER + 'video/' + tab + '/', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json() )
    .then( index => {
        setter( index );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  getEpisodes() - get video Episodes
 **********************************************************************/
function getEpisodes( recno, setter ){

    //console.log(`VideoApi getEpisodes()`);

    return fetch( SERVER + 'video/episodes/' + recno, {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(episodes => {
        setter( episodes );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
 /*********************************************************************
 *  getLock() - video lock lesen
 *********************************************************************/
 async function getLockASync( recno ){

    //console.log(`VideoApi getLockASync()`);

    try{
        const response = await fetch( 
            
                    SERVER + 'video/lock/' + recno, {
                    method: 'GET', 
                    mode:"cors",
                    headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                    },
        });
        return ( await response.json() ).result[0].lock;
    }
    catch( error ){
        console.error('getLockASync() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    }
}
function getLock( recno, setter ){

    //console.log(`VideoApi getLock()`);

    return fetch( SERVER + 'video/lock/' + recno, {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        setter( data.result[0].lock ); 
    })
    .catch((error) => {
        console.error('getLock() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    });
}
/*********************************************************************
 *  setLock() - video lock setzen
 *********************************************************************/
async function setLockASync( recno, vlock, vkey = ""  ){

    //console.log(`VideoApi setLock()`);
    try{
        const response = await fetch( 
            
                    SERVER + 'video/lock/' + recno, {
                    method: 'POST', 
                    mode:"cors",
                    headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                    body: JSON.stringify( { lock: vlock, key: vkey } )
        });
        return await response.json();
    }
    catch( error ){
        //console.error('setLockSync() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    }
}
function setLock( recno, vlock, vkey = "", setter = null  ){

    //console.log(`VideoApi setLock()`);

    return fetch( SERVER + 'video/lock/' + recno, {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( { lock: vlock, key: vkey } )
    })
    .then(response => response.json())
    .then(data => {
        if( setter  ) setter( data );
    })
    .catch((error) => {
        console.error('setLock() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    });
}
/*********************************************************************
 *  getOne() - get one video
 **********************************************************************/
function getOne( recno, setter ){

    //console.log(`VideoApi getOne()`);

    return fetch( SERVER + 'video/detail/' + recno, {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(video => {
        setter( video );
    })
    .catch((error) => {
        console.error('getOne() Error:', error.message);
        return( { error: true, errMsg: error, result: [] } );
    });
 }
/*********************************************************************
 *  find() - find videos
 **********************************************************************/
 function find( filter, page = 0, setter ){

    //console.log(`VideoApi find()`);

    return fetch( SERVER + 'video/find?' + filter + "&page=" + page , {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(videos => {
        setter( videos );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
 /*********************************************************************
 *  getNews() - get newest video
 **********************************************************************/
function getNews( setter ){

    //console.log(`VideoApi getNews()`);

    return fetch( SERVER + 'video/news', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(news => {
        setter( news );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }


const videoApi = {
    find,
    getOne,
    putOne,
    putOneASync,
    getEpisodes,
    getIndexTab,
    getNews,
    getLockASync,
    getLock,
    setLockASync,
    setLock,
    setPoster,
    setPosterASync,
    setFanart,
    setFanartASync,
    setEpiThumbASync,
    setEpisodeASync
}
export default videoApi; 