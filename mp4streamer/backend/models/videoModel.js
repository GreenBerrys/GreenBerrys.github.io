/********************************************************************************* 
 * 
 */
import database from "../Database/database.js";

const FIELDS = [ "title", "subtitle", "director", "country", "year", "genre", "tag", "plot" ]; 
/********************************************************************************* 
 * getDirectors() 
 * 
 */
async function getDirectors() { 

    return await database.getDirectors();
}
/********************************************************************************* 
 * getActors() 
 * 
 */
async function getActors() { 

    return await database.getActors();
}
/********************************************************************************* 
 * getGenres() 
 * 
 */
async function getGenres() { 

    return await database.getGenres();
}
/********************************************************************************* 
 * getTags() 
 * 
 */
async function getTags() { 

    return await database.getTags();
}
/********************************************************************************* 
 * getOne() 
 * 
 */
async function getOne( recno ) { 

        return await database.getOne( recno );
 }
/********************************************************************************* 
 * getEpisodes() 
 * 
 */
async function getEpisodes( recno ) { 

    return await database.getEpisodes( recno );
}
/********************************************************************************* 
 * getEpisodeThumb() - 
 */
async function getEpisodeThumb( recno, epino, videoroot, defaultPic ){
    
    return await database.getEpisodeThumb( recno, epino, videoroot, defaultPic )

}
/********************************************************************************* 
 * find() 
 * 
 */
 async function find( search, page , pageLen ) { 

    const xsearch = Object.entries( search );

    if( xsearch.length && FIELDS.includes( xsearch[0][0] ) ){
        return await database.find( [ xsearch[0] ], page, pageLen );
    }
    else{
        return await database.find( [ [ FIELDS[0], '' ] ], page, pageLen );
    }    
 }
/********************************************************************************* 
 * count() 
 * 
 */
async function count( search ) { 

    const xsearch = Object.entries( search );

    if( xsearch.length && FIELDS.includes( xsearch[0][0] ) ){
        return await database.count( [ xsearch[0] ] );
    }
    else{
        return await database.count( [] );
    }    
 }
/********************************************************************************* 
 * getPoster() - 
 */
async function getPoster( recno, videoroot, defaultPic ){
    
    return await database.getPoster( recno, videoroot, defaultPic )

}
/********************************************************************************* 
 * getFanart() - 
 */
async function getFanart( recno, videoroot, defaultPic ){
    
    return await database.getFanart( recno, videoroot, defaultPic )

}
/********************************************************************************* 
 * getStream() - 
 */
async function getStream( recno, videoroot ){

    return await database.getStream( recno, videoroot )

}
/********************************************************************************* 
 * getEpisodeStream() - 
 */
async function getEpiStream( recno, epiNo, videoroot ){

    return await database.getEpiStream( recno, epiNo, videoroot );
}
export default {
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
    getDirectors,
    getActors
};
