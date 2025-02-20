import fs  from 'fs';

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
const genrebase = initJsonBase( GENREPATH );
const tagbase = initJsonBase( TAGPATH );
const newsbase = initJsonBase( NEWSPATH );

/********************************************************************************* 
 * find() - search videos
 */
async function  find( search, page, pageLen ) {

    if( search.length) 
        return getPage( search[0][0], search[0][1], page, pageLen );     
    else
        return getPage( 'title', '', page, pageLen );     
}
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
const fieldComp = ( field, str, recno ) =>{

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
 * getPage() - replace getpage()
 */
const getPage = ( field, str, page, pageLen ) => {
    
    let result = [];

    let andFields = [];
    let aFound = true;
    let orFields = [];
    let oFound = false;

    //console.log(`\n---GETMPAGE()-------------------------------------------------------------\n field="${field}"  str="${str}"\n--------------------------------------------------------------------------`);

    for( let i = 0, itemCount = 0; i < database.length && result.length < pageLen; i++ ){

        andFields = str.split( "&&" );
        aFound = true;

        for( let aF = 0; aF < andFields.length && aFound; aF++ ){

            orFields = andFields[ aF ].split( "||" );
            oFound = false;

            if( orFields.length > 1 ){

                for( let oF = 0; oF < orFields.length && !oFound; oF++ ){    

                    oFound |= fieldComp( field, orFields[oF], i);

                    //console.log(`oFound=${oFound}  orFields[${oF}]="${orFields[oF]}" `);
                }
                aFound &= oFound;                
            }
            else
                aFound &= fieldComp( field, andFields[aF], i);

            //console.log(`aFound=${aFound}  andFields[${aF}]="${andFields[aF]}" `);
        }
        if( aFound ){

            //console.log(`FOUND aFound=${aFound}`)

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
 * count() - count all movies found for calculating pages  
 */
async function count( search ) {

    if( search.length === 0 ){
        //console.log(`--> COUNT(${database.length})`);
        return database.length;
    } 

    const field = search[0][0];
    const str =  search[0][1];

    let andFields = [];
    let aFound = true;
    let orFields = [];
    let oFound = false;

    let itemCount = 0;

    //console.log(`\n---COUNT()----------------------------------------------------------------\n field="${field}"  str="${str}"\n--------------------------------------------------------------------------`);

    for( let i = 0; i < database.length; i++ ){

        andFields = str.split( "&&" );
        aFound = true;

        for( let aF = 0; aF < andFields.length && aFound; aF++ ){

            orFields = andFields[ aF ].split( "||" );
            oFound = false;

            if( orFields.length > 1 ){

                for( let oF = 0; oF < orFields.length && !oFound; oF++ ){    

                    oFound |= fieldComp( field, orFields[oF], i);

                    //console.log(`oFound=${oFound}  orFields[${oF}]="${orFields[oF]}" `);
                }
                aFound &= oFound;                
            }
            else
                aFound &= fieldComp( field, andFields[aF], i);

            //console.log(`aFound=${aFound}  andFields[${aF}]="${andFields[aF]}" `);
        }
        if( aFound ){
            itemCount++;        
        } 
    }
    //console.log(`--> COUNT(${itemCount})`);
    return itemCount;
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
            tag:       database[recno].tag, 
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
 * getGenres() - 
 */
const getGenres = () => { return genrebase }

/********************************************************************************* 
 * getTags() - 
 */
const getTags = () => { return tagbase }

/********************************************************************************* 
 * getNews() - 
 */
const getNews = () => { return newsbase };  

/********************************************************************************* 
 * getDirectors() - 
 */
const getDirectors = () => { return JSON.parse( fs.readFileSync( DIRECTORPATH, { encoding:'utf8', flag:'r' } ) ) };  
    
/********************************************************************************* 
 * getActors() - 
 */
const getActors = () => { return JSON.parse( fs.readFileSync( ACTORPATH, { encoding:'utf8', flag:'r' } ) ) };  

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
    find,
    count,
    getOne,
    getPoster,
    getFanart,
    getStream,
    getEpisodes,
    getEpisodeThumb,
    getEpiStream,
    getGenres,
    getTags,
    getActors,
    getDirectors,
    getNews
}