/******************************************************************************************
 * 
 * RATINGS API
 * 
 */
import userApi from "./userApi.js"; 
import { SERVER } from "../config.js";

/*  FUNCTION                                 TESTED     NOTE    
    ---------------------------------------------------------------------------------------
    create( commentObject, callBack() )                      
    find( queryString, page, callBack() )                
    get( queryObject, callBack() )                         
    update( commentObject, callBack() )              
    delete( commentID, callBack() )        
*/
/*********************************************************************
 *  create() - create new rating 
 *********************************************************************/
 function create( newRating, setter   ){

    //console.log("Rating FETCH create");

    return fetch( SERVER + 'rating/', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( newRating )
    })
    .then( response => response.json())
    .then( rating => {
        setter( rating );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  find() - find ratings 
 *********************************************************************/
 function find( filter, page = 0, setter ){

    //console.log("Rating FETCH find");

    return fetch( SERVER + `rating/find?${filter}&page=${page}`,{
       
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(ratings => {
        setter( ratings );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  get() - get a rating by ID  
 *********************************************************************/
function get( rating, setter ){

    //console.log("Rating FETCH get");

    return fetch( SERVER + 'rating?' + Object.keys(rating)[0] + '=' + Object.values(rating)[0], {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(rating => {
        setter( rating );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  update() - update a rating 
 *********************************************************************/
 function update( rating, setter ){

    //console.log("Comment FETCH update");

    return fetch( SERVER + 'rating/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( rating )
    })
    .then(response => response.json())
    .then(rating => {
        setter( rating );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  del() - delete a rating bei id
 *********************************************************************/
 function del( ratingID, setter ){

    //console.log("Comment FETCH delete");

    return fetch( SERVER + 'rating/', {
        method: 'DELETE', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( { 'ratingid': ratingID } )
    })
    .then(response => response.json())
    .then(rating => {
        setter( rating );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

const commentApi = {
    create,
    find,
    get,
    update,
    del    
}
export default commentApi; 