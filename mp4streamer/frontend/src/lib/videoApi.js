/******************************************************************************************
 * 
 * VIDEO API
 * 
 */
 import { SERVER } from "../config.js";

/*********************************************************************
 *  getDirectors() - get directors
 **********************************************************************/
function getDirectors( setter ){

    //console.log("user FETCH directors",SERVER + 'video/directors/');

    return fetch( SERVER + 'video/directors/', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(directors => {
        setter( directors );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  getActors() - get actors
 **********************************************************************/
function getActors( setter ){

    //console.log("user FETCH actors",SERVER + 'video/actors/');

    return fetch( SERVER + 'video/actors/', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(actors => {
        setter( actors );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  getTags() - get video tags
 **********************************************************************/
function getTags( setter ){

    //console.log("user FETCH tags",SERVER + 'video/tags/');

    return fetch( SERVER + 'video/tags/', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(tags => {
        setter( tags );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  getGenres() - get video genres
 **********************************************************************/
function getGenres( setter ){

    //console.log("user FETCH genres",SERVER + 'video/genres/');

    return fetch( SERVER + 'video/genres/', {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(genres => {
        setter( genres );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  getEpisodes() - get video Episodes
 **********************************************************************/
function getEpisodes( recno, setter ){

    //console.log("user FETCH episodes",SERVER + 'video/getEpisodes/' + recno);

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
 *  getOne() - get one video
 **********************************************************************/
function getOne( recno, setter ){

    //console.log("user FETCH getOne",SERVER + 'video/get/' + recno);

    return fetch( SERVER + 'video/?recno=' + recno, {
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
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  find() - find videos
 **********************************************************************/
 function find( filter, page = 0, setter ){

    //console.log("user FETCH find",SERVER + 'video?' + filter + "&page=" + page);

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

const videoApi = {
    find,
    getOne,
    getEpisodes,
    getGenres,
    getTags,
    getActors,
    getDirectors
}
export default videoApi; 