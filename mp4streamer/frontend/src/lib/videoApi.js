/******************************************************************************************
 * 
 * VIDEO API
 * 
 */
 import { SERVER } from "../config.js";

/*********************************************************************
 *  getIndexTab() - get Index table
 **********************************************************************/
function getIndexTab( tab, setter ){

    //console.log("user FETCH index",SERVER + 'video/' + tab + '/');

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
 /*********************************************************************
 *  getNews() - get newest video
 **********************************************************************/
function getNews( setter ){

    //console.log("user FETCH getNews",SERVER + 'video/news;

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
    getEpisodes,
    getIndexTab,
    getNews
}
export default videoApi; 