/******************************************************************************************
 * 
 * COMMENT API
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
 *  create() - create new comment 
 *********************************************************************/
 function create( newComment, setter   ){

    //console.log("Comment FETCH create");

    return fetch( SERVER + 'comment/', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token,
        },
        body: JSON.stringify( newComment )
    })
    .then( response => response.json())
    .then( comment => {
        setter( comment );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  find() - find comments 
 *********************************************************************/
 function find( filter, page = 0, setter ){

    //console.log("Comment FETCH find");

    return fetch( SERVER + 'comment/find?' + filter + "&page=" + page , {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(comments => {
        setter( comments );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  get() - get a comment by ID  
 *********************************************************************/
function get( comment, setter ){

    //console.log("Comment FETCH get");

    return fetch( SERVER + 'comment?' + Object.keys(comment)[0] + '=' + Object.values(comment)[0], {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(comment => {
        setter( comment );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  update() - update a comment 
 *********************************************************************/
 function update( comment, setter ){

    //console.log("Comment FETCH update");

    return fetch( SERVER + 'comment/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token,
        },
        body: JSON.stringify( { commentid: comment._id,
                                text: comment.text } )
    })
    .then(response => response.json())
    .then(comment => {
        setter( comment );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  del() - delete a comment bei id
 *********************************************************************/
 function del( commentID, setter ){

    //console.log("Comment FETCH delete");

    return fetch( SERVER + 'comment/', {
        method: 'DELETE', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( { 'commentid': commentID } )
    })
    .then(response => response.json())
    .then(comment => {
        setter( comment );
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