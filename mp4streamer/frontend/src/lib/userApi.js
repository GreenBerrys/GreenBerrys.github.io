/******************************************************************************************
 * 
 * USER API
 * 
 */
 import { SERVER } from "../config.js";

/*********************************************************************/

/*********************************************************************
 *  logout() - logout 
 *********************************************************************/
 function logout( setter   ){

    //console.log("User FETCH logout");

    return fetch( SERVER + 'user/logout', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(response => {
        setter( response );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  login() - login 
 *********************************************************************/
 function login( user, setter   ){

    //console.log("User FETCH login");

    return fetch( SERVER + 'user/login', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( user )
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}

const userApi = {
    login,
    logout
}
export default userApi; 