import fs  from 'fs';
import dotenv from "dotenv";
import queryString from "node:querystring";
import video from "../models/videoModel.js";
import log from "../utils/logger.js";

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

/********************************************************************************* 
 * get one video
 * 
 */
async function getOne( req, res ){

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    try{
        if( req.body.recno )
            res.status( 200 ).json( { error: false, result: await video.getOne( parseInt( req.body.recno ) ) } );
        else
            res.status( 400 ).json( { error: true, errMsg: 'missing recno!', result: [] } ); 
    }
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * get episodes
 */
async function getEpisodes( req, res ) {

    try{
        if( !req.params )
            res.status( 400 ).json( { error: true, errMsg: 'missing recno!', result: [] } ); 
        else
            res.status( 200 ).json( { error: false, result: await video.getEpisodes( parseInt( req.params['0'] ) ) } ); 
        return;
    }
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * find videos
 */
let lastSearch = null;
let lastPage = 0;
let lastCount = 0;

async function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    const search=Object.entries( req.body );

    try{

        if( search.length ){
            if( search[0][1] !== lastSearch ){

                lastSearch = search[0][1];
                lastCount = await video.count( req.body );
                lastPage = ( ( lastCount - ( lastCount % PAGELEN) ) / PAGELEN + ( ( lastCount % PAGELEN ) > 0 ) ) -1;
            }
        } 
        else{
            lastCount = await video.count( req.body );
            lastPage = ( ( lastCount - ( lastCount % PAGELEN) ) / PAGELEN + ( ( lastCount % PAGELEN ) > 0 ) ) -1;
        }

        let page = parseInt( req.body.page || '0');
        if( page > lastPage )
            page = lastPage;
        else if( page < 0 ){
            page = 0;
        }
        const videos = await video.find( req.body, page, req.body.pageLen || PAGELEN ); 

        res.status( 200 ).json( { error: false, count: lastCount, page: page, lastPage: lastPage, result: videos } );   
        return;
    } 
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * get episode thumb
 */
async function getEpisodeThumb( req, res ) {

    try {
        if( req.params ){

            const pic = await video.getEpisodeThumb( parseInt( req.params['recno'] ),
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
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * get poster
 */
async function getPoster( req, res ) {

    try {
        if( req.params ){

            const pic = await video.getPoster( parseInt( req.params['0']), VIDEOROOT, HOMEPATH + 'default.jpg' );
	

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
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * get fanart
 */
async function getFanart( req, res ) {

    try {
        if( req.params ){

            const pic = await video.getFanart( parseInt( req.params['0']), VIDEOROOT, HOMEPATH + 'default.jpg' );

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
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
/********************************************************************************* 
 * Stream Video
 */
let Recno;
let EpiNo;
let Path;
let Filesize;

async function getStream( req, res ) {

    const CHUNKSIZE =  200 * 1000000;         // 200MB chunks

    try {
            if( Recno !== req.params.recno || EpiNo !== req.params.epino ){

                Recno = req.params.recno;
                EpiNo = req.params.epino;
                Path = req.params.epino ?  await video.getEpiStream( parseInt( req.params.recno ), 
                                                                     parseInt( req.params.epino ), VIDEOROOT )
                                        :
                                           await video.getStream( parseInt( req.params.recno ), VIDEOROOT );

                                           
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
    catch ( error ) { 

        console.log( error.message );
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}

export default {

    find,
    getOne,
    getPoster,
    getFanart,
    getStream,
    getEpisodes,
    getEpisodeThumb
}
