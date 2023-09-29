import fs  from 'fs';

const DATAPATH='Database/movies.json'
let database = null;

/********************************************************************************* 
 * count() - 
 */
async function count( search ) {

    let itemCount = 0;

    if( search.length === 0 )
       return database.length; 

    for( let i = 0; i < database.length; i++ ){

        if( strComp( database[i][search[0][0]], search[0][1] ) )
            itemCount++;        
    }
    return itemCount;
}

/********************************************************************************* 
 * find() - 
 */
async function  find( search, page, pageLen ) {

    if( search.length) 
        return getPage( search[0][0], search[0][1], page, pageLen );     
    else
        return getPage( 'title', '', page, pageLen );     
}
/********************************************************************************* 
 * getOne() - 
 */
async function  getOne( recno ) {

    let result = [];

    if( recno >= 0 && recno < database.length ){
        
        result.push( {
            recno:     database[recno].recno, 
            path:      database[recno].path,
            serie:     database[recno].serie,
            title:     database[recno].title, 
            subtitle:  database[recno].subtitle, 
            director:  database[recno].director,
            year:      database[recno].year, 
            country:   database[recno].country, 
            genre:     database[recno].genre, 
            poster:    database[recno].poster, 
            fanart:    database[recno].fanart, 
            plot:      database[recno].plot
            }
        );    
    } 
    return result;     
}
/********************************************************************************* 
 * getEpisodes() - 
 */
async function  getEpisodes( recno ) {

    const result = [];

    if( recno >= 0 && recno < database.length ){

        if( database[recno].serie){

            for( let episode of database[recno].episoden )

            result.push( {
                title:     episode.title, 
                subtitle:  episode.subtitle,
                director:  episode.director,
                season:    episode.season,
                episode:   episode.episode, 
                plot:      episode.plot 
                }
            );    
        }    
    } 
    return result;     
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
 * find a page
 */
const getPage = ( field, str, page, pageLen ) => {

    let result = [];

    for( let i = 0, itemCount = 0; i < database.length && result.length < pageLen; i++ ){

        if( strComp( database[i][field], str ) ){

            if( itemCount / pageLen >= page ){
                result.push( {
                    recno:     database[i].recno, 
                    serie:     database[i].serie,
                    title:     database[i].title, 
                    subtitle:  database[i].subtitle, 
               } );
            }
            itemCount++;        
        }
    }
    return result;
}
/********************************************************************************* 
 * Stringcompare
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
 * init() - 
 */
const init = () => {
    
    if( fs.existsSync( DATAPATH ) ){

        database = JSON.parse( fs.readFileSync( DATAPATH, { encoding:'utf8', flag:'r' } ) );
    }
    else{
        console.log(`"${ DATAPATH }" not found..`);                
        process.exit(-1);
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
 * getFanart() - 
 */
const getFanart = ( recno, videoroot, defaultPic ) => {
   
    if( recno < 0 || recno >= database.length )
        return defaultPic;

        const path = database[recno].path[0] !== '\\' && database[recno].path[1] !== ':' ?
                     videoroot + database[recno].path + '/' + database[recno].fanart :
                     database[recno].path + '/' + database[recno].fanart;

    if( fs.existsSync( path )  && path.endsWith(".jpg") )
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
 * getStream() - 
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
    init,
    find,
    count,
    getOne,
    getPoster,
    getFanart,
    getStream,
    getEpisodes,
    getEpisodeThumb,
    getEpiStream
}