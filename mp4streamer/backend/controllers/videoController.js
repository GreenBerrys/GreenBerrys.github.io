import fs  from 'fs';
import dotenv from "dotenv";
import queryString from "node:querystring";
import video from "../models/videoModel.js";
import log from "../utils/logger.js";
import { timeStamp } from 'node:console';

dotenv.config( { path: "./server.env" } );
//--------------------------------------------------------------------------

const ARGS = process.argv;

const DLM = ARGS[1][1] !== ':' ? '/' : '\\';
const DRV = ARGS[1][1] !== ':' ? '' : ARGS[1].substring( ARGS[1], 2);
const HOMEPATH = ARGS[1][1] !== ':' ? '/' + ARGS[1].substring( 0, ARGS[1].lastIndexOf( DLM ) +1 ) :
                                           ARGS[1].substring( 2, ARGS[1].lastIndexOf( DLM ) +1 );

const VIDEOROOT = HOMEPATH + 'public' + DLM;

//--------------------------------------------------------------------------

const PAGELEN = parseInt(process.env.s_PAGESIZE);

const setError = ( res, source, message ) => { res.status( 400 ).json( { error: true, errMsg: source + ' : ' + message, result: [] } ); 
                                               return;
                                            }

/********************************************************************************* 
 * find() - find videos
 */
let lastField = null;
let lastSearch = null;
let lastPage = 0;
let lastCount = 0;

function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    const search=Object.entries( req.body );

    if( search.length ){
        search[0][1] = search[0][1].replaceAll(".EQU.","==").replaceAll(".NOT.","!=").replaceAll(".AND.","&&").replaceAll(".OR.","||");
        req.body[search[0][0]] = search[0][1];
    }

    try{

        if( search.length ){
            if( search[0][1] !== lastSearch || search[0][0] !== lastField ){

                lastSearch = search[0][1];
                lastField = search[0][0];
                lastCount = video.count( req.body );
                lastPage = ( ( lastCount - ( lastCount % PAGELEN) ) / PAGELEN + ( ( lastCount % PAGELEN ) > 0 ) ) -1;
            }
        } 
        else{
            lastCount = video.count( req.body );
            lastPage = ( ( lastCount - ( lastCount % PAGELEN) ) / PAGELEN + ( ( lastCount % PAGELEN ) > 0 ) ) -1;
        }

        let page = parseInt( req.body.page || '0');
        if( page > lastPage )
            page = lastPage;
        else if( page < 0 ){
                page = 0;
        }
        
        const videos = video.find( req.body, page, req.body.pageLen || PAGELEN ); 

        res.status( 200 ).json( { error: false, count: lastCount, page: page, lastPage: lastPage, result: videos } );   
        return;
    } 
    catch ( error ) { console.log( setError( res, "Server find()", error.message ) ); return; }
}
/********************************************************************************* 
 * getLock() - get video lock status
 */
function getLock( req, res ){

    //console.log("--------------------------------- videoController getLock()")
    try{
        if( req.params.recno !== undefined ){

            res.status( 200 ).json( { error: false, result: video.getLock( parseInt( req.params.recno ) ) } );
        }
        else
            res.status( 400 ).json( { error: true, errMsg: 'missing recno', result: [] } ); 

        return;
    }
    catch ( error ) { console.log( setError( res, "Server getLock()", error.message ) ); return; }
}
/********************************************************************************* 
 * setLock() - lock / unlock video record 
 */
function setLock( req, res ){

    //console.log("--------------------------------- videoController setLock()")

    try{
        if( req.params  && req.body.lock !== undefined ){

            res.status( 200 ).json( { error: false, 
                                      result: video.setLock( parseInt( req.params.recno ), 
                                                                   req.body.lock, 
                                                                   req.body.key || "" ) 
            } );
        }
        else
            res.status( 400 ).json( { error: true, errMsg: 'missing recno or lock', result: [] } ); 

        return;
    }
    catch ( error ) { console.log( setError( res, "Server setLock()", error.message ) ); return; }
}
/********************************************************************************* 
 * putOne() - write video data
 */
async function putOne( req, res ){

    //console.log(`videoController putOne() \nkey=${req.body.key}\ndata=${JSON.stringify(req.body.data)}`)


    if( !req.params ){
        return res.status( 400 ).json( { error: true, errMsg: "missing recno", result: [] } ); 
    }
    if( !req.body.key ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing key", result: [] } ); 
    }    
    if( !req.body.data ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing data", result: [] } ); 
    }    

    try{

        res.status( 200 ).json(   await video.putOne( VIDEOROOT, req.body.key, req.body.data )  );
        return;
    }
    catch ( error ) { console.log( setError( res, "Server putOne()", error.message ) ); return; }
}
/********************************************************************************* 
 * getOne() - get video data
 * 
 */
function getOne( req, res ){

    try{
        if( req.params )
            res.status( 200 ).json( { error: false, result: video.getOne( parseInt( req.params[ 'recno' ] ) ) } );
        else
            res.status( 400 ).json( { error: true, errMsg: 'missing recno!', result: [] } ); 

        return
    }
    catch ( error ) { console.log( setError( res, "Server getOne()", error.message ) ); return; }
}
/********************************************************************************* 
 * getEpisodes() - get episodes from video (series)
 */
function getEpisodes( req, res ) {

    try{
        if( !req.params )
            res.status( 400 ).json( { error: true, errMsg: 'missing recno!', result: [] } ); 
        else
            res.status( 200 ).json( { error: false, result: video.getEpisodes( parseInt( req.params['recno'] ) ) } ); 

        return;
    }
    catch ( error ) { console.log( setError( res, "Server getEpisode()", error.message ) ); return; }
}
/********************************************************************************* 
 * getEpisodeThumb() - get video serie episode thumb
 */
function getEpisodeThumb( req, res ) {

    try {
        if( req.params ){

            const pic = video.getEpisodeThumb( parseInt( req.params['recno'] ),
                                               parseInt( req.params['epino'] ), 
                                               VIDEOROOT, HOMEPATH + 'default.jpg' );

            if( pic[0] === '\\' && ARGS[1][1] === ':' )
                res.status( 200 ).sendFile( DRV + pic );
            else    
                res.status( 200 ).sendFile( pic.substring( pic.lastIndexOf( DLM ) ), { root: pic.substring( 0, pic.lastIndexOf( DLM ) ) } );
        }
        else
            res.status( 200 ).sendFile( HOMEPATH + 'default.jpg' );

        return;
    } 
    catch ( error ) { console.log( setError( res, "Server getEpisodeThumb()", error.message ) ); return; }
}
/********************************************************************************* 
 * getNews() - get newest videos
 */
function getNews( req, res ){

    try{ return res.status( 200 ).json( { error: false, result: video.getNews() } );
    }
    catch ( error ) { console.log( setError( res, "Server getNews()", error.message ) ); return; }
}
/********************************************************************************* 
 * getGenres() - get genre index
 */
function getGenres( req, res ) {

    try { return res.status( 200 ).json( { error: false, result: video.getGenres() } );
    } 
    catch ( error ) { console.log( setError( res, "Server getGenres()", error.message ) ); return; }
}
/********************************************************************************* 
 * getTags() - get tag index
 */
function getTags( req, res ) {

    try { return res.status( 200 ).json( { error: false, result: video.getTags() } );
    } 
    catch ( error ) { console.log( setError( res, "Server getTags()", error.message ) ); return; }
}
/********************************************************************************* 
 * getDirectors() - get director index
 */
function getDirectors( req, res ) {

    try { return res.status( 200 ).json( { error: false, result: video.getDirectors() } ); 
    } 
    catch ( error ) { console.log( setError( res, "Server getDirectors)", error.message ) ); return; }
}
/********************************************************************************* 
 * getActors() - get actor index
 */
function getActors( req, res ) {

    try { return res.status( 200 ).json( { error: false, result: video.getActors() } );
    } 
    catch ( error ) { console.log( setError( res, "Server getActors()", error.message ) ); return; }
    }
/********************************************************************************* 
 * setPoster() - set video poster
 */
async function setPoster( req, res ) {

    let result = [];

    if( !req.params ){
        return res.status( 400 ).json( { error: true, errMsg: "missing recno", result: [] } ); 
    }
    if( !req.body.key ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing key", result: [] } ); 
    }    
    if( !req.files || !req.files.poster ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing picture", result: [] } ); 
    }    

    const recNo = req.params[ 'recno' ].includes( '.' ) ? req.params[ 'recno' ].substring( 0, req.params[ 'recno' ].lastIndexOf( '.') ) : 
                                                          req.params[ 'recno' ];
    try{

        let tStamp = req.body.posterStamp || Date.now();

        result = await video.setPoster( parseInt( recNo ), VIDEOROOT, req.body.key, req.files.poster, tStamp );
        return res.status( 200 ).json( result ); 
    }
    catch ( error ) { console.log( setError( res, "Server setPoster()", error.message ) ); return; }
}
/********************************************************************************* 
 * getPoster() - get video poster
 */
function getPoster( req, res ) {

    try {
        if( req.params ){

            const recNo = req.params[ 'recno' ].includes( '.' ) ? req.params[ 'recno' ].substring( 0, req.params[ 'recno' ].lastIndexOf( '.') ) : 
                                                                  req.params[ 'recno' ];

            const pic = video.getPoster( parseInt( recNo ), VIDEOROOT, HOMEPATH + 'default.jpg' );
	
            if( pic[0] === '\\' && ARGS[1][1] === ':' )
                res.status( 200 ).sendFile( DRV + pic );
            else    
                res.status( 200 ).sendFile( pic.substring( pic.lastIndexOf( DLM ) ), { root: pic.substring( 0, pic.lastIndexOf( DLM ) ) } );

        }
        else{
            res.status( 200 ).sendFile( 'default.jpg', {root: HOMEPATH} );
	    }

        return;
    } 
    catch ( error ) { console.log( setError( res, "Server getPoster()", error.message ) ); return; }
}
/********************************************************************************* 
 * setFanart() - set video fanart
 */
async function setFanart( req, res ) {

    let result = [];

    if( !req.params ){
        return res.status( 400 ).json( { error: true, errMsg: "missing recno", result: [] } ); 
    }
    if( !req.body.key ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing key", result: [] } ); 
    }    
    if( !req.files || !req.files.fanart ) {
        return res.status( 400 ).json( { error: true, errMsg: "missing picture", result: [] } ); 
    }    

    const recNo = req.params[ 'recno' ].includes( '.' ) ? req.params[ 'recno' ].substring( 0, req.params[ 'recno' ].lastIndexOf( '.') ) : 
                                                          req.params[ 'recno' ];
    try{

        let tStamp = req.body.fanartStamp || Date.now();

        result = await video.setFanart( parseInt( recNo ), VIDEOROOT, req.body.key, req.files.fanart, tStamp );
        return res.status( 200 ).json( result ); 
    }
    catch ( error ) { console.log( setError( res, "Server setFanart()", error.message ) ); return; }
}
/********************************************************************************* 
 * getFanart() - get video fanart
 */
function getFanart( req, res ) {

    try {
        if( req.params ){

            const pic = video.getFanart( parseInt( req.params['recno']), VIDEOROOT, HOMEPATH + 'default.jpg' );

            if( pic[0] === '\\' && ARGS[1][1] === ':' )
                res.status( 200 ).sendFile( DRV + pic );
            else    
                res.status( 200 ).sendFile( pic.substring( pic.lastIndexOf( DLM ) ), { root: pic.substring( 0, pic.lastIndexOf( DLM ) ) } );
        }
        else{
            res.status( 200 ).sendFile( HOMEPATH + 'default.jpg' );
	    }

        return;
    } 
    catch ( error ) { console.log( setError( res, "Server getFanart()", error.message ) ); return; }
}
/********************************************************************************* 
 * getStream() - stream Video
 */
let Recno;
let EpiNo;
let Path;
let Filesize;

function getStream( req, res ) {

    const CHUNKSIZE =  200 * 1000000;         // 200MB chunks

    try {
            if( Recno !== req.params.recno || EpiNo !== req.params.epino ){

                Recno = req.params.recno;
                EpiNo = req.params.epino;
                Path = req.params.epino ? video.getEpiStream( parseInt( req.params.recno ), 
                                                              parseInt( req.params.epino ), VIDEOROOT )
                                        :
                                          video.getStream( parseInt( req.params.recno ), VIDEOROOT );

                                           
                if( Path ){
                    Filesize = fs.statSync( Path ).size;
                    log.logger(Path.substring(Path.lastIndexOf('/')), req);
                }
            }

            if( !Path ){
                res.status( 404 ).send( "File not found !" ); 
                return;
            }

            const videoRange = req.headers.range;

            if (videoRange) {

                const parts = videoRange.replace( /bytes=/, "" ).split( "-" );
                const start = parseInt( parts[0], 10 );
                
                const end = parts[1] ? parseInt( parts[1], 10 ) : Filesize - 1;

                const chunksize = ( end-start ) +1 < CHUNKSIZE ? ( end - start ) +1 : CHUNKSIZE; 
                
                const file = fs.createReadStream( Path, { start, end } );
                const header = {
                                'Content-Range': `bytes ${start}-${end}/${Filesize}`,
                                'Accept-Ranges': 'bytes',
                                'Content-Length': chunksize,
                                'Content-Type': 'video/mp4',
                            };
        
                // write something in the session cookie so that the cookie will be sent.
                req.session.Magic = Math.floor(Date.now() / 0x60e3 );

                res.writeHead( 206, header );
                file.pipe( res );

            } else {

                const head = {
                                'Content-Length': Filesize,
                                'Content-Type': 'video/mp4',
                            };

                res.writeHead( 200, head );
                fs.createReadStream( Path ).pipe( res );
            }
        return;
    } 
    catch ( error ) { console.log( setError( res, "Server getStream()", error.message ) ); return; }
}

export default {

    find,
    getOne,
    putOne,
    getPoster,
    setPoster,
    getFanart,
    setFanart,
    getStream,
    getEpisodes,
    getEpisodeThumb,
    getGenres,
    getTags,
    getDirectors,
    getActors,
    getNews,
    getLock,
    setLock
}
