/******************************************************************************************
 * 
 * RECIPE API
 * 
 */
import userApi from "./userApi.js"; 
import { SERVER } from "../config.js";


/*  FUNCTION                                 TESTED     NOTE    
    ---------------------------------------------------------------------------------------
    create( recipeObject, callBack() )                      
    find( queryString, page, callBack() )                
    get( queryObject, callBack() )                         
    update( recipeObject, callBack() )              
    delete( recipeID, callBack() )        
*/
/*********************************************************************
 *  create() - create new recipe 
 *********************************************************************/
 function create( newRecipe, setter   ){

    //console.log("Recipe FETCH create");

    return fetch( SERVER + 'recipe/', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( newRecipe )
    })
    .then(response => response.json())
    .then(recipe => {
        setter( recipe );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  find() - find recipes 
 *********************************************************************/
 function find( { filter, page = 0 }, setter ){

    //console.log("Recipe FETCH find");

    return fetch( SERVER + 'recipe/find?' + filter + "&page=" + page , {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(recipes => {
        setter( recipes );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  get() - get a recipe by ID or Name 
 *********************************************************************/
function get( filter, setter ){

    //console.log("Recipe FETCH get");

    return fetch( SERVER + 'recipe?' + filter, {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(recipe => {
        setter( recipe );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  update() - update a recipe 
 *********************************************************************/
 function update( recipe, setter  ){

    //console.log("Recipe FETCH update");

    return fetch( SERVER + 'recipe/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( recipe )
    })
    .then(response => response.json())
    .then(recipe => {
        setter( recipe );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  del() - delete a recipe bei id
 *********************************************************************/
 function del( recipeID, setter ){

    //console.log("Recipe FETCH delete");

    return fetch( SERVER + 'recipe/', {
        method: 'DELETE', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: JSON.stringify( { 'recipeid': recipeID } )
    })
    .then(response => response.json())
    .then(recipe => {
        setter( recipe );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  picUpload() - upload recipepicture
 *********************************************************************/
 function picUpload( recipeID, picture, setter ){

    //console.log("recipe FETCH picUpload", recipeID);

    const ptime = '.' + Date.now();

    const formData = new FormData();
    formData.append( 'recipeid', recipeID );
    formData.append( 'ptime', ptime );
    formData.append( 'picture', picture );

    return fetch( SERVER + 'recipe/picture/' + recipeID + ptime, {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Accept': 'application/json',
        'x-access-token' : userApi.getUser().token
        },
        body: formData
    })
    .then(response => response.json())
    .then(recipe => {
        setter( recipe );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
    
}

const recipeApi = {
    create,
    find,
    get,
    update,
    del,
    picUpload    
}
export default recipeApi; 