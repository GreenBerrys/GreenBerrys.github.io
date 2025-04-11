import { error } from 'console';
import fs  from 'fs';
import xml2js, { parseString } from 'xml2js';
// import { title } from 'process';

const DATAPATH='Database/movies.json';
const GENREPATH='Database/genres.json';
const TAGPATH='Database/tags.json';
const ACTORPATH='Database/actors.json';
const DIRECTORPATH='Database/directors.json';
const NEWSPATH='Database/news.json';

/********************************************************************************* 
 * initJsonBase() -  Init JSON-Tabels 
 */
const initJsonBase = ( path ) =>  { if( fs.existsSync( path ) ) 
                                        return JSON.parse( fs.readFileSync( path, { encoding:'utf8', flag:'r' } ) );
                                    else{
                                        console.log(`\nDatei "${ path }" nicht gefunden!\nBitte zuerst mkJSONbase ausführen..\n\n   node mkJSONbase\n`);
                                        process.exit(-1);  }
                                    }  
                                      
const database = initJsonBase( DATAPATH );

const newsbase = initJsonBase( NEWSPATH );
const genrebase = initJsonBase( GENREPATH );
const tagbase = initJsonBase( TAGPATH );
const directorbase = initJsonBase( DIRECTORPATH );
const actorbase = initJsonBase( ACTORPATH );

/********************************************************************************* 
 * strComp()    String compare
 */
const strComp = ( field, str ) => {

    if( str === '' || str === '*' )
        return true;

    if( str[0] === '<' )
        return field.toLowerCase() < str.substring(1).toLowerCase();

    if( str[0] === '>' )
        return field.toLowerCase() > str.substring(1).toLowerCase();

    if( str[0] === '*')
        return field.toLowerCase().includes( str.substring(1).toLowerCase() );
    else
        return field.toLowerCase().startsWith( str.toLowerCase() );
}
/********************************************************************************* 
 *  fieldComp()   
 */
const fieldComp = ( field, str, recno ) => {

    const isEqual = str.indexOf( '==' );
    const isNot = str.indexOf( '!=' );
    let equal = false;

    // simple search
    if( isEqual === -1 && isNot === -1 ){

        equal = strComp( database[ recno ][ field ], str );
    }
    else{// user defined search
        const fields = isEqual !== -1 ? str.split( '==' ) : str.split( '!=' );

        switch( fields[ 0 ].toLowerCase().trim() ){

            case 'name':
            case 'titel':
            case 'title':
                 field = 'title';
                 break;
            case 'handlung':
            case 'plot':
                 field = 'plot';
                 break;
            case 'jahr':
            case 'year':
                 field = 'year';
                 break;
            case 'regie':
            case 'director':
            case 'direction':
                 field = 'director';
                 break;
            case 'genre':
                 field = 'genre';
                 break;
            case 'tag':
                 field = 'tag';
                 break;
            default:
                 field = 'title';
                 break;
        }
        equal = isEqual !== -1 ? strComp( database[ recno ][ field ], fields[ 1 ].trim() ): 
                                 !strComp( database[ recno ][ field ], fields[ 1 ].trim() );
    }
    return equal;
}
/********************************************************************************* 
 * getPage() 
 */
const getPage = ( field, str, page, pageLen ) => {
    
    let result = [];

    let andFields = [];
    let aFound = true;
    let orFields = [];
    let oFound = false;

    for( let i = 0, itemCount = 0; i < database.length && result.length < pageLen; i++ ){

        andFields = str.split( "&&" );
        aFound = true;

        for( let aF = 0; aF < andFields.length && aFound; aF++ ){

            orFields = andFields[ aF ].split( "||" );
            oFound = false;

            if( orFields.length > 1 ){

                for( let oF = 0; oF < orFields.length && !oFound; oF++ ){    

                    oFound |= fieldComp( field, orFields[oF], i);
                }
                aFound &= oFound;                
            }
            else
                aFound &= fieldComp( field, andFields[aF], i);
        }
        if( aFound ){

            if( itemCount / pageLen >= page ){
                result.push( {
                    recno:     database[i].recno, 
                    serie:     database[i].serie,
                    title:     database[i].title, 
                    subtitle:  database[i].subtitle, 
                    posterStamp: database[i].posterStamp,
                    fanartStamp: database[i].fanartStamp
                } );
            }
            itemCount++;        
        } 
    }
    return result;
}
/********************************************************************************* 
 * find() - search videos
 */
const find = ( search, page, pageLen ) => {

    if( search.length) 
        return getPage( search[0][0], search[0][1], page, pageLen );     
    else
        return getPage( 'title', '', page, pageLen );     
}
/********************************************************************************* 
 * count() - count all movies found for calculating pages  
 */
const count = ( search ) => {

    if( search.length === 0 ){
        return database.length;
    } 

    const field = search[0][0];
    const str =  search[0][1];

    let andFields = [];
    let aFound = true;
    let orFields = [];
    let oFound = false;

    let itemCount = 0;

    for( let i = 0; i < database.length; i++ ){

        andFields = str.split( "&&" );
        aFound = true;

        for( let aF = 0; aF < andFields.length && aFound; aF++ ){

            orFields = andFields[ aF ].split( "||" );
            oFound = false;

            if( orFields.length > 1 ){

                for( let oF = 0; oF < orFields.length && !oFound; oF++ ){    

                    oFound |= fieldComp( field, orFields[oF], i);
                }
                aFound &= oFound;                
            }
            else
                aFound &= fieldComp( field, andFields[aF], i);
        }
        if( aFound ){
            itemCount++;        
        } 
    }
    return itemCount;
}
/********************************************************************************* 
 * getLock() - 
 */
const getLock = ( recno ) => {

    const result = [];

    if( recno >= 0 && recno < database.length ){
       
        result.push( { lock: database[ recno ].lock } );
    } 
    return result;     
}
/********************************************************************************* 
 * setLock() - 
 */
const uID = () => String(Date.now().toString(32)+Math.random().toString(16)).replace(/[/\\ §!@#$%^&*(),.?":{}|<>]/g,'');

const setLock =( recno, lock, key ) => {

    const result = [];

    if( recno >= 0 && recno < database.length ){

        if( !database[ recno ].lock ){

            // LOCK unlocked database record
            if( lock ){
                database[ recno ].lock = true;
                database[ recno ].lockKey = uID();
                result.push( { key: database[ recno ].lockKey } );
/*
                console.log(`Database setLock( recno=${recno}, lock=${lock}, key="${key}" ) ` + 
                            `: database(${recno}) lock=${database[recno].lock} lockKey="${database[recno].lockKey}" ) LOCKED`);
*/                            
            }
        }
        else{
            // UNLOCK locked database record
            if( !lock ){
                if( key === database[ recno ].lockKey ){
                    database[ recno ].lock = false;
                    result.push( { key: database[ recno ].lockKey } );
/*
                    console.log(`Database setLock( recno=${recno}, lock=${lock}, key="${key}" ) ` + 
                            `: database(${recno}) lock=${database[recno].lock} lockKey="${database[recno].lockKey}" ) UNLOCKED`);
*/                            
                }
            }
        }
    } 
    return result;     
}
/********************************************************************************* 
 * bakupOldFile() - rename old File by name + increment 
 */
const bakupOldFile = async ( path, oFile,  ) => {

    const name = oFile.substring( 0, oFile.lastIndexOf( '.' ) );
    const ext = oFile.substring( oFile.lastIndexOf( '.' ) );    
    try{
        let no = -1, noStr ="", pfile = "";
        do{
            no++;
            noStr = '(' + ( "0".repeat( 4 - String( no ).length ) + no ) + ')';
            pfile = path + '/' + name + "-EDIT" + noStr + ext;
        }
        while( fs.existsSync( pfile ))
        
            
        if( fs.existsSync( path + '/' + oFile ) )
            fs.renameSync( path + '/' + oFile, pfile );
    }
    catch ( error ){
        return { error: true, errMsg: `Server: ${error.message }`}
    }
}
/********************************************************************************* 
 * chngName() - change Name parts for search in actorsindex )
 */
const chngName = ( parts ) => {
    
    const name = String(parts).trim().split(" ");

    if( name.length >  1 ){
        return name[ name.length-1 ] + " " + name.slice( 0, name.length -1).join(" "); 
    }
    else{
        return name[0];
    }
}
/********************************************************************************* 
 * searchActor() - search actor in indextab
 */
const searchActor = ( actor ) => {

    let start = 0;
    let end = actorbase.length - 1;
    let mid = 0;
    actor = chngName( actor ).toUpperCase();
    
    // search for section
    while ( start <= end ) {

        mid = Math.floor( ( start + end ) / 2 );
        if( actorbase[ mid ].section === actor[0] ) {

            // search for actor in section
            let sectNo = mid;
            start = 0;
            end = actorbase[ sectNo ].items.length - 1;

            while ( start <= end ) {

                mid = Math.floor( ( start + end ) / 2 );
                if( actorbase[ sectNo ].items[ mid ][ 0 ].toUpperCase() === actor ) {

                    return { sectNo: sectNo, itemNo: mid } // actor found -->
                }
                actor < actorbase[ sectNo ].items[ mid ][ 0 ].toUpperCase() ? end = mid - 1 : start = mid + 1;
            }
            return null; // Actor not found --->
        }
        actor[0] < actorbase[ mid ].section ? end = mid - 1 : start = mid + 1;
    }
    return null;  // Section not found -->
}
/********************************************************************************* 
 * splitActors() - 
 */
const splitActors = ( txtPart, orderTab ) => {

let actor = [];
let actorName = "";
let actorRole = "";
let actorThumb = "";

const orderNo = ( actor, role ) => { 
        
    const no = orderTab.indexOf( ( item ) => item[ 0 ] === actor && item[ 1 ] === role ); 
    if( no < 0 ){
      orderTab.push( [ actor, role ] );
      return orderTab.length -1;  
    }
    return no;
};

if( txtPart.length ){
    
    const actorSplit = txtPart.split('\n');

    for( let actorLine of actorSplit ){

        if( actorLine.length ){
        
            actorLine = actorLine.trim(); 

            if ( actorLine.length && actorLine.includes(':') ){

                // split actor and role
                let actorPart = actorLine.split(':');                   

                if( actorPart[0].length && actorPart.length > 1 ){

                    // get actorname
                    actorName = actorPart[0].trim();

                    if( actorName.length ){
                        
                        // get actor role 
                        actorRole = actorPart[1].trim();

                        if( actorRole.length > 1){
                             
                            // remove double quotes set by mkJSONbase
                            if( actorRole.startsWith('"') )
                                actorRole = actorRole.substring( 1 );

                            if( actorRole.endsWith('"') )
                                actorRole = actorRole.substring( 0, actorRole.length -1 );
                        }
                        if( !actorRole.length )
                            actorRole = "";     

                        // get actor photo from indextab 
                        const actorRec = searchActor( actorName );
                        if( actorRec !== null )
                            actorThumb = actorbase[ actorRec.sectNo ].items[ actorRec.itemNo ][1];
                        else 
                            actorThumb = "";

                        actor.push( { name: actorName, role: actorRole, order: orderNo( actorName, actorRole ), thumb: actorThumb } )
                    }
                }
            }
        }
    }
}
return actor;
}
/********************************************************************************* 
 * saveSingleVideoData() - 
 */
const saveSingleVideoData = async ( videoRoot, recno ) => {

    const orderTab = [];
    let actors=[];
    
    try{    
    
        const PATH = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoRoot + database[recno].path : database[recno].path;
    
        const nfoFile = database[ recno ].file.substring( 0, database[ recno ].file.lastIndexOf( '.' ) ) + '.nfo';
    
        
        let xmlJSON = {};
    
        if( fs.existsSync( PATH + '/' + nfoFile ) ){
    
            // -------------- Get XML-File as JSON 
            const xmlIN =  String( fs.readFileSync( PATH + '/' + nfoFile ) )
                                    .replaceAll( "& ", "&amp; " ).replaceAll( '&#8211;', ' - ' );
        
            xmlJSON = await xml2js.parseStringPromise( xmlIN, { explicitArray: false } ).then( (result) => { return result } );
            
            // -------------- Bakup NFO-File
            await bakupOldFile( PATH, nfoFile );
        }
        else{
            xmlJSON.movie = {};
        }
    
        // -------------- save title 
        xmlJSON.movie.title = database[recno].title.trim(); 
        // -------------- save directors 
        xmlJSON.movie.director = database[recno].director.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save year 
        xmlJSON.movie.year =  database[recno].year.trim();
        // -------------- save countries 
        xmlJSON.movie.country = database[recno].country.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save genres
        xmlJSON.movie.genre = database[recno].genre.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save tags
        xmlJSON.movie.tag = database[recno].tag.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save plot
        const plotSplit = ( database[recno].plot.split("\nDARSTELLER:\n") );
        xmlJSON.movie.plot = plotSplit[0].trim();
    
        // -------------- save actors
        if( plotSplit.length > 1 ){
    
            // get actors
            actors = splitActors( plotSplit[1].trim(), orderTab );     
        }
        if( actors.length ){
            xmlJSON.movie.actor = actors;
        }
        else{
            delete xmlJSON.movie.actor;
        }    


        // -------------- Build XML-File 
        const options ={ 'explicitArray': false, 'rootName': 'movie', 'explicitRoot': true };
        const xmlOUT = ( new xml2js.Builder( options ) ).buildObject( xmlJSON.movie );
    
        // -------------- Write XML-File 
        fs.writeFileSync( PATH + '/' + nfoFile, xmlOUT, { flag: "wx"} ); 
    
        return { error: false };
    }
    catch( error ){
    
        return { error: true, errMsg: `Server: ${error.message }`}
    }
}
/********************************************************************************* 
 * saveSerieVideoData() - 
 */
const saveSerieVideoData = async ( videoRoot, recno ) => {

    const orderTab = [];
    let actorPart = [];
    let actors = [];
    let xmlIN = "";

    try{    
    
        const PATH = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoRoot + database[recno].path : database[recno].path;
    
        const nfoFile = 'tvshow.nfo';
    
        let xmlJSON = {};

        if( fs.existsSync( PATH + '/' + nfoFile ) ){
    
            // -------------- Get XML-File as JSON 
            xmlIN =  String( fs.readFileSync( PATH + '/' + nfoFile ) )
                                .replaceAll( "& ", "&amp; " ).replaceAll( '&#8211;', ' - ' );
        
            xmlJSON = await xml2js.parseStringPromise( xmlIN, { explicitArray: false } ).then( (result) => { return result } );
            
            // -------------- Bakup NFO-File
            await bakupOldFile( PATH, nfoFile );
        }
        else{
            xmlJSON.tvshow = {};
        }
    
        // -------------- save title 
        xmlJSON.tvshow.title = database[recno].title.trim(); 
        // -------------- save directors 
        xmlJSON.tvshow.director = database[recno].director.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save year 
        xmlJSON.tvshow.year =  database[recno].year.trim();
        // -------------- save countries 
        xmlJSON.tvshow.country = database[recno].country.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save genres
        xmlJSON.tvshow.genre = database[recno].genre.split(',').map( ( item ) => { return item.trim() } );
        // -------------- save tags
        xmlJSON.tvshow.tag = database[recno].tag.split(',').map( ( item ) => { return item.trim() } );
        
        // -------------- save plot
        const plotSplit = ( database[recno].plot.split("\nDARSTELLER:\n") );
        xmlJSON.tvshow.plot = plotSplit[0].trim();
    
        // -------------- save actors
    
        if( plotSplit.length > 1 ){

            // ---------------------> get actors for tvshow.nfo

            actorPart = plotSplit[1].split("\n\nEpisode ");

            // get part with actors
            // -------------- save actors
            if( actorPart.length ){
    
                // get actors
                actors = splitActors( actorPart[0].trim(), orderTab ); 
            }
            if( actors.length ){
                xmlJSON.tvshow.actor = actors;
            }    
            else{
                delete xmlJSON.tvshow.actor;
            }    
        }    
    
        // -------------- Build XML-File 
        let options ={ 'explicitArray': false, 'rootName': 'tvshow', 'explicitRoot': true };
        let xmlOUT = ( new xml2js.Builder( options ) ).buildObject( xmlJSON.tvshow );
    
        // -------------- Write XML-File (tvshow.nfo) 
        fs.writeFileSync( PATH + '/' + nfoFile, xmlOUT, { flag: "wx"} ); 

        // ============================== save episode actors

        options ={ 'explicitArray': false, 'rootName': 'episodedetails', 'explicitRoot': true };
        let epiNo = 0;
        let epiFile = "";
        xmlJSON = {};

        if( actorPart.length > 1 ){ 

            for( let i = 1; i < actorPart.length; i++){

                epiNo = parseInt( actorPart[i] );

                if( epiNo > 0 && epiNo <= database[recno].episoden.length ){

                    xmlJSON.movie = {};
                    epiNo--;
                    actors = splitActors( actorPart[i].substring( actorPart[i].indexOf('\n') ), orderTab );

                    epiFile = database[ recno ].episoden[ epiNo ].file.
                                substring( 0, database[ recno ].episoden[ epiNo ].file.lastIndexOf( '.' ) ) + ".nfo";

                    if( fs.existsSync( PATH + '/' + epiFile ) ){
            
                        // -------------- Get XML-File as JSON 
                        xmlIN =  String( fs.readFileSync( PATH + '/' + epiFile ) )
                                            .replaceAll( "& ", "&amp; " ).replaceAll( '&#8211;', ' - ' );
                    
                        xmlJSON = await xml2js.parseStringPromise( xmlIN, { explicitArray: false } ).then( (result) => { return result } );
                        
                        // -------------- Bakup NFO-File
                        await bakupOldFile( PATH, epiFile );

                        if( actors.length ){  
                            xmlJSON.episodedetails.actor = actors;
                        }
                        else{
                            delete xmlJSON.episodedetails.actor;
                        }    

                        // -------------- Build XML-File 
                        const xmlOUT = ( new xml2js.Builder( options ) ).buildObject( xmlJSON.episodedetails );
                    
                        // -------------- Write XML-File 
                        fs.writeFileSync( PATH + '/' + epiFile, xmlOUT, { flag: "wx"} ); 
                    }
                }
            }
        }
        return { error: false };
    }
    catch( error ){
    
        return { error: true, errMsg: `Server: ${error.message }`}
    }
}
/********************************************************************************* 
 * putOne() - 
 */
const putOne = async ( videoRoot, key, data ) => {

    //console.log(`-----\ndatabase putOne()\nkey=${key}\ndata=${data}`)

    if( data.recno >= 0 && data.recno < database.length && database[ data.recno ].lock && database[ data.recno ].lockKey === key ){
       
        // -------------- Update database
        database[data.recno].title = data.title; 
        database[data.recno].director = data.director;
        database[data.recno].year = data.year; 
        database[data.recno].country = data.country; 
        database[data.recno].genre = data.genre; 
        database[data.recno].tag = data.tag; 
        database[data.recno].plot = data.plot;

        if( !database[data.recno].serie )
            return await saveSingleVideoData( videoRoot, data.recno );
        else
            return await saveSerieVideoData( videoRoot, data.recno );
    }

    return { error: true, errMsg: "Server: Wrong recno or Key" };     
}
/********************************************************************************* 
 * getOne() - 
 */
const getOne = ( recno ) => {

    const result = [];

    if( recno >= 0 && recno < database.length ){
        
        result.push( {
            lock:        database[recno].lock,
            recno:       database[recno].recno,
            posterStamp: database[recno].posterStamp,
            fanartStamp: database[recno].fanartStamp,
            serie:       database[recno].serie,
            title:       database[recno].title, 
            director:    database[recno].director,
            year:        database[recno].year, 
            country:     database[recno].country, 
            genre:       database[recno].genre, 
            tag:         database[recno].tag, 
            plot:        database[recno].plot
            }
        );    
    } 
    return result;     
}
/********************************************************************************* 
 * getEpisodes() - 
 */
const getEpisodes = ( recno ) => {

    const result = [];

    if( recno >= 0 && recno < database.length ){

        if( database[recno].serie){

            for( let episode of database[recno].episoden )

            result.push( {
                title:       episode.title, 
                subtitle:    episode.subtitle,
                director:    episode.director,
                season:      episode.season,
                episode:     episode.episode, 
                plot:        episode.plot,
                thumbStamp:  episode.thumbStamp,
                fanartStamp: database[recno].fanartStamp  // only for Episodes-Modul in Frontend
                }
            );    
        }    
    } 
    return result;     
}
/********************************************************************************* 
 * setEpisodes() - 
 */
const setEpisode = async ( recno, epino, videoRoot, key, title, plot ) => {

try{
    let xmlIN = "";
    let xmlJSON = {};

    if( recno >= 0 && recno < database.length && database[ recno ].lock && database[ recno ].lockKey === key ){
        
        if( !database[ recno ].serie || epino < 0 || epino >= database[ recno ].episoden.length )
            return { error: true, errMsg: "Server: no serie or wrong episode number" };     

        const PATH = database[ recno ].path[ 0 ] !== '\\' && database[ recno ].path[ 1 ] !== ':' ?
                                                             videoRoot + database[ recno ].path : database[ recno ].path;
        
        const NAME = database[ recno ].episoden[ epino ].file.substring( 0, database[ recno ].episoden[ epino ].file.lastIndexOf( '.' ) ) + ".nfo";

        if( fs.existsSync( PATH + '/' + NAME ) ){
    
            // -------------- Get XML-File as JSON 
            xmlIN =  String( fs.readFileSync( PATH + '/' + NAME ) )
                                .replaceAll( "& ", "&amp; " ).replaceAll( '&#8211;', ' - ' );
        
            xmlJSON = await xml2js.parseStringPromise( xmlIN, { explicitArray: false } ).then( (result) => { return result } );
            
            // -------------- Bakup NFO-File
            await bakupOldFile( PATH, NAME );
        }
        else{
            xmlJSON.episodedetails = {};
        }
        database[ recno ].episoden[ epino ].title = title;
        database[ recno ].episoden[ epino ].showtitle = database[ recno ].title;
        database[ recno ].episoden[ epino ].plot = plot;

        xmlJSON.episodedetails.title = title;
        xmlJSON.episodedetails.showtitle = database[ recno ].title;
        xmlJSON.episodedetails.plot = plot;

        // -------------- Build XML-File 
        let options ={ 'explicitArray': false, 'rootName': 'episodedetails', 'explicitRoot': true };
        let xmlOUT = ( new xml2js.Builder( options ) ).buildObject( xmlJSON.episodedetails );
    
        // -------------- Write XML-File (tvshow.nfo) 
        fs.writeFileSync( PATH + '/' + NAME, xmlOUT, { flag: "wx"} ); 
        
        return { error: false };
    }
}
catch( error ){
    return { error: true, errMsg: `Server: ${error.message }`}
}
}
/********************************************************************************* 
 * getEpisodeThumb
 */
const getEpisodeThumb = ( recno, epino, videoroot, defaultPic ) => {
    
    if( recno < 0 || recno >= database.length || !database[recno].serie ||
                     epino < 0 || epino >= database[recno].episoden.length )  
        return defaultPic;

    const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                 videoroot + database[recno].path + '/' + database[recno].episoden[epino].thumb :
                 database[recno].path + '/' + database[recno].episoden[epino].thumb;


    if( fs.existsSync( path ) && path.endsWith(".jpg") )
        return path;
    else
        return defaultPic;
}
/********************************************************************************* 
 * setEpisodeThumb
 */
const setEpisodeThumb = async ( recno, epino, videoRoot, key, thumb, tStamp ) => {

    try{
    //console.log(`database setPoster(${recno}) key=${key}  dblock=${database[ recno ].lock} dbkey=${database[ recno ].lockKey}`)

    if( recno >= 0 && recno < database.length && database[ recno ].lock && database[ recno ].lockKey === key ){
        
        if( !database[ recno ].serie || epino < 0 || epino >= database[ recno ].episoden.length )
            return { error: true, errMsg: "Server: no serie or wrong episode number" };     

        const PATH = database[ recno ].path[ 0 ] !== '\\' && database[ recno ].path[ 1 ] !== ':' ?
                                                             videoRoot + database[ recno ].path : database[ recno ].path;
        
        const NAME = database[ recno ].episoden[ epino ].file.substring( 0, database[ recno ].episoden[ epino ].file.lastIndexOf( '.' ) ) + "-thumb.jpg";

        database[ recno ].episoden[ epino ].thumb = NAME;
        database[ recno ].episoden[ epino ].thumbStamp = tStamp;

        await bakupOldFile( PATH, NAME );
        await thumb.mv( PATH + '/' + NAME );    
        
        return { error: false };
    }
    return { error: true, errMsg: "Server: Wrong recno or Key" };     
}
catch( error ){

    return { error: true, errMsg: `Server: ${error.message }`}

}
}
/********************************************************************************* 
 * getNews() - 
 */
const getNews = () => { return newsbase };  
/********************************************************************************* 
 * getGenres() - 
 */
const getGenres = () => { return genrebase }
/********************************************************************************* 
 * getTags() - 
 */
const getTags = () => { return tagbase }
/********************************************************************************* 
 * getDirectors() - 
 */
const getDirectors = () => { return directorbase };  
/********************************************************************************* 
 * getActors() - 
 */
const getActors = () => { return actorbase };  

/********************************************************************************* 
 * setPoster() - 
 */
const setPoster = async ( recno, videoRoot, key, poster, tStamp ) => {
    
    try{
        //console.log(`database setPoster(${recno}) key=${key}  dblock=${database[ recno ].lock} dbkey=${database[ recno ].lockKey}`)

        if( recno >= 0 && recno < database.length && database[ recno ].lock && database[ recno ].lockKey === key ){
            
            const PATH = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                        videoRoot + database[recno].path : database[recno].path;

            if( !database[ recno ].poster.length || ( database[ recno ].poster === database[ recno ].thumb ) ){

                if( !database[ recno ].serie ){
                    database[ recno ].poster = 
                        database[ recno ].file.substring( 0, database[ recno ].file.lastIndexOf( '.' ) ) +
                        "-poster.jpg";
                }
                else {
                    database[ recno ].poster = "poster.jpg";
                }        
            }
            await bakupOldFile( PATH, database[ recno ].poster );
            await poster.mv( PATH + '/' + database[ recno ].poster );    

            database[ recno ].posterStamp = tStamp;

            return { error: false };
        }
        return { error: true, errMsg: "Server: Wrong recno or Key" };     
    }
    catch( error ){

        return { error: true, errMsg: `Server: ${error.message }`}

    }
}
/********************************************************************************* 
 * getPoster() - 
 */
const getPoster = ( recno, videoroot, defaultPic ) => {
    
    if( recno < 0 || recno >= database.length )
        return defaultPic;
    
      const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                   videoroot + database[recno].path + '/' + database[recno].poster :
                   database[recno].path + '/' + database[recno].poster;

    if( fs.existsSync( path ) && path.endsWith(".jpg") )
        return path;
    else
        return defaultPic;
        
}
/********************************************************************************* 
 * setFanart() - 
 */
const setFanart = async ( recno, videoRoot, key, fanart, tStamp ) => {
    
    try{
        //console.log(`database setPoster(${recno}) key=${key}  dblock=${database[ recno ].lock} dbkey=${database[ recno ].lockKey}`)
    
        if( recno >= 0 && recno < database.length && database[ recno ].lock && database[ recno ].lockKey === key ){
            
            const PATH = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                         videoRoot + database[recno].path : database[recno].path;

            if( !database[ recno ].fanart.length ){

                if( !database[ recno ].serie ){
                    database[ recno ].fanart = 
                        database[ recno ].file.substring( 0, database[ recno ].file.lastIndexOf( '.' ) ) +
                        "-fanart.jpg";
                }
                else {
                    database[ recno ].fanart = "fanart.jpg";
                }
            }
    
            await bakupOldFile( PATH, database[ recno ].fanart );
            await fanart.mv( PATH + '/' + database[ recno ].fanart );    
    
            database[ recno ].fanartStamp = tStamp;
    
            return { error: false };
        }
        return { error: true, errMsg: "Server: Wrong recno or Key" };     
    }
    catch( error ){
    
        return { error: true, errMsg: `Server: ${error.message }`}
    
    }
}
/********************************************************************************* 
 * getFanart() - 
 */
const getFanart = ( recno, videoroot, defaultPic ) => {
   
    if( recno < 0 || recno >= database.length )
        return defaultPic;

        const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoroot + database[recno].path + '/' + database[recno].fanart :
                     database[recno].path + '/' + database[recno].fanart;

    if( fs.existsSync( path ) && path.endsWith(".jpg") )
        return path;
    else
        return defaultPic;
}
/********************************************************************************* 
 * getStream() - 
 */
const getStream = ( recno, videoroot ) => {
   
    if( recno < 0 || recno >= database.length )
        return null;

        const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoroot + database[recno].path + '/' + database[recno].file :
                     database[recno].path + '/' + database[recno].file;

    if( fs.existsSync( path )  && path.endsWith(".mp4") )
        return path;
    else
        return null;
}
/********************************************************************************* 
 * getEpiStream() - 
 */
const getEpiStream = ( recno, epiNo, videoroot ) => {
   
    if( recno < 0 || recno >= database.length || !database[recno].serie ||
        epiNo < 0 || epiNo >= database[recno].episoden.length )  
        return null;

        const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoroot + database[recno].path + '/' + database[recno].episoden[epiNo].file :
                     database[recno].path + '/' + database[recno].episoden[epiNo].file;

    if( fs.existsSync( path )  && path.endsWith(".mp4") )
        return path;
    else
        return null;
}

export default{
    find,
    count,
    getOne,
    putOne,
    getPoster,
    setPoster,
    getFanart,
    setFanart,
    getStream,
    getEpisodes,
    setEpisode,
    getEpisodeThumb,
    setEpisodeThumb,
    getEpiStream,
    getGenres,
    getTags,
    getActors,
    getDirectors,
    getNews,
    getLock,
    setLock
}