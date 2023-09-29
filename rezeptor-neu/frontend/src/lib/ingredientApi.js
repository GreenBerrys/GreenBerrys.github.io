/******************************************************************************************
 * 
 * INGREDIENT API
 * 
 */
import userApi from "./userApi.js"; 
import { SERVER } from "../config.js";


/*  FUNCTION                                 TESTED     NOTE    
    ---------------------------------------------------------------------------------------
    create( ingredientObject, callBack() )                      
    find( queryString, page, callBack() )                
    get( queryObject, callBack() )                         
    update( ingredientObject, callBack() )              
    delete( ingredientID, callBack() )        
*/
/*********************************************************************
 *  createSync() - create new ingredient 
 *********************************************************************/
 async function createSync( newIngredient ){

    //console.log("ingredient FETCH createSync");

try{
    const response = await fetch( SERVER + 'ingredient/', {

        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( newIngredient )
    });
    return await response.json();

    }   
    catch(error){
        console.error('Error:', error.message);
    } 
}
/*********************************************************************
 *  create() - create new ingredient 
 *********************************************************************/
function create( newIngredient, setter   ){

    //console.log("ingredient FETCH create");

    return fetch( SERVER + 'ingredient/', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( newIngredient )
    })
    .then(response => response.json())
    .then(ingredient => {
        setter( ingredient );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  find() - find ingredients 
 *********************************************************************/
 function find( {filter, page = 0 }, setter ){

    //console.log("ingredient FETCH find");

    return fetch( SERVER + 'ingredient/find?' + filter + "&page=" + page , {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(ingredients => {
        setter( ingredients );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  get() - get a ingredient by ID or Name 
 *********************************************************************/
function get( ingredient, setter ){

    //console.log("ingredient FETCH get");

    return fetch( SERVER + 'ingredient?' + Object.keys(ingredient)[0] + '=' + Object.values(ingredient)[0], {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(ingredient => {
        setter( ingredient );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  update() - update a ingredient 
 *********************************************************************/
 function update( ingredient, setter  ){

    //console.log("ingredient FETCH update");

    return fetch( SERVER + 'ingredient/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( ingredient )
    })
    .then(response => response.json())
    .then(ingredient => {
        setter( ingredient );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  del() - delete a ingredient bei id
 *********************************************************************/
 function del( ingredientID, setter ){

    //console.log("ingredient FETCH delete");

    return fetch( SERVER + 'ingredient/', {
        method: 'DELETE', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( { 'ingredientid': ingredientID } )
    })
    .then(response => response.json())
    .then(ingredient => {
        setter( ingredient );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

const ingredientApi = {
    create,
    createSync,
    find,
    get,
    update,
    del
}
export default ingredientApi; 