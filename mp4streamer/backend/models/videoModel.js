/********************************************************************************* 
 * 
 */
import database from "../Database/database.js";

const FIELDS = [ "title", "subtitle", "director", "country", "year", "genre", "tag", "plot" ]; 

/********************************************************************************* 
 * find() 
 */
const find = ( search, page , pageLen ) => { 

    const xsearch = Object.entries( search );

    if( xsearch.length && FIELDS.includes( xsearch[0][0] ) ){
        return database.find( [ xsearch[0] ], page, pageLen );
    }
    else{
        return database.find( [ [ FIELDS[0], '' ] ], page, pageLen );
    }    
 }
/********************************************************************************* 
 * count() 
 */
const count = ( search ) => { 

    const xsearch = Object.entries( search );

    if( xsearch.length && FIELDS.includes( xsearch[0][0] ) ){
        return database.count( [ xsearch[0] ] );
    }
    else{
        return database.count( [] );
    }    
}
/********************************************************************************* 
 * getLock() 
 */
const getLock = ( recno ) => { return database.getLock( recno ); }

/********************************************************************************* 
 * setLock() 
 */
const setLock = ( recno, lock, key ) => { return database.setLock( recno, lock, key ); }

/********************************************************************************* 
 * putOne() 
 */
const putOne = async ( videoRoot, key, data ) => { 
    
    return await database.putOne( videoRoot, key, data ); 
}

/********************************************************************************* 
 * getOne() 
 */
const getOne = ( recno ) => { return database.getOne( recno ); }

/********************************************************************************* 
 * getEpisodes() 
 */
const getEpisodes = ( recno ) => { return database.getEpisodes( recno ); }

/********************************************************************************* 
 * setEpisode() 
 */
const setEpisode = async ( recno, epino, videoRoot, key, title, plot ) => { 
    
    return await database.setEpisode( recno, epino, videoRoot, key, title, plot ); 
}
/********************************************************************************* 
 * getEpisodeThumb() 
 */
const getEpisodeThumb = ( recno, epino, videoroot, defaultPic ) => {
    
    return database.getEpisodeThumb( recno, epino, videoroot, defaultPic );
}

/********************************************************************************* 
 * setEpisodeThumb() 
 */
const setEpisodeThumb = async ( recno, epiNo, videoRoot, key, thumb, tStamp ) => { 
    
    return await database.setEpisodeThumb( recno, epiNo, videoRoot, key, thumb, tStamp ); 
}
/********************************************************************************* 
 * getNews() - 
 */
const getNews = () => { return database.getNews(); }
/********************************************************************************* 
 * getGenres() 
 */
const getGenres = () => { return database.getGenres(); }
/********************************************************************************* 
 * getTags() 
 */
const getTags = () => { return database.getTags(); }
/********************************************************************************* 
 * getDirectors() 
 */
const getDirectors = () => { return database.getDirectors(); }
/********************************************************************************* 
 * getActors() 
 */
const getActors = () => { return database.getActors(); }

/********************************************************************************* 
 * setPoster() 
 */
const setPoster = async ( recno, videoRoot, key, poster, tStamp ) => {
    
    return await database.setPoster( recno, videoRoot, key, poster, tStamp );
}
/********************************************************************************* 
 * getPoster()  
 */
const getPoster = ( recno, videoroot, defaultPic ) => {
    
    return database.getPoster( recno, videoroot, defaultPic );
}
/********************************************************************************* 
 * setFanart() 
 */
const setFanart = async ( recno, videoRoot, key, fanart, tStamp ) => { 
    
    return await database.setFanart( recno, videoRoot, key, fanart, tStamp ); 
}
/********************************************************************************* 
 * getFanart() 
 */
const getFanart = ( recno, videoroot, defaultPic ) => {
    
    return database.getFanart( recno, videoroot, defaultPic );
}
/********************************************************************************* 
 * getStream() - 
 */
const getStream = ( recno, videoroot ) => { return database.getStream( recno, videoroot ); }
/********************************************************************************* 
 * getEpisodeStream() - 
 */
const getEpiStream = ( recno, epiNo, videoroot ) => { 
    
    return database.getEpiStream( recno, epiNo, videoroot ); 
}


export default {
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
    getDirectors,
    getActors,
    getNews,
    getLock,
    setLock
};
