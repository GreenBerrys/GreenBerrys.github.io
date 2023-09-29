/******************************************************************************************
 * 
 * USER API
 * 
 */
 import { SERVER } from "../config.js";

/*  FUNCTION                                 TESTED     NOTE    
    ---------------------------------------------------------------------------------------
    create( userObject, callBack() )                      
    find( queryString, page, callBack() )                
    get( queryObject, callBack() )                         
    update( userObject, callBack() )              
    delete( userID, callBack() )        
*/
/*********************************************************************/
let USER = { _id: null };

/*********************************************************************
 *  setUser() - set userdata  (login)
 *********************************************************************/
function setUser( user ){

    USER = Object.assign( USER, user );
    return USER;   
}
/*********************************************************************
 *  getUser() - get userdata  (login)
 *********************************************************************/
function getUser( user ){

    return USER;
}
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
/*********************************************************************
 *  sendMail() - send activationmail 
 *********************************************************************/
 function sendMail( userID, setter   ){

    //console.log("User FETCH sendMail");

    return fetch( SERVER + 'user/sendMail', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( { userid: userID } )
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  picUpload() - upload userpicture
 *********************************************************************/
 function picUpload( userID, picture, setter ){

    //console.log("User FETCH picUpload");

    const ptime = '.' + Date.now();

    const formData = new FormData();
    formData.append( 'userid', userID );
    formData.append( 'ptime', ptime );
    formData.append( 'picture', picture );

    return fetch( SERVER + 'user/picture/' + userID + ptime,
       {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Accept': 'application/json',
        'x-access-token' : USER.token
        },
        body: formData
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
    
}
/*********************************************************************
 *  create() - create new user 
 *********************************************************************/
 function create( newUser, setter   ){

    //console.log("User FETCH create");

    return fetch( SERVER + 'user/', {
        method: 'POST', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify( newUser )
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  find() - find users 
 *********************************************************************/
 function find( {filter, page = 0 }, setter ){

    //console.log("user FETCH find");

    return fetch( SERVER + 'user/find?' + filter + "&page=" + page , {
        method: 'GET', 
        mode:"cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    })
    .then(response => response.json())
    .then(users => {
        setter( users );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
 }
/*********************************************************************
 *  get() - get a user by ID or Name 
 *********************************************************************/
function get( user, setter ){

    //console.log("User FETCH get");

    return fetch( SERVER + 'user?' + Object.keys(user)[0] + '=' + Object.values(user)[0], {
        method: 'GET', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : USER.token
        },
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  update() - update a user 
 *********************************************************************/
 function update( user, setter  ){

    //console.log("User FETCH update");

    return fetch( SERVER + 'user/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : USER.token
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
/*********************************************************************
 *  del() - delete a user bei id
 *********************************************************************/
 function del( userID, setter ){

    //console.log("User FETCH delete");

    return fetch( SERVER + 'user/', {
        method: 'DELETE', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : USER.token
        },
        body: JSON.stringify( { 'userid': userID } )
    })
    .then(response => response.json())
    .then(user => {
        setter( user );
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
}
/*********************************************************************
 *  pwChange() - change password
 *********************************************************************/
 function pwChange( pwobj, setter  ){

    //console.log("User FETCH update");

    return fetch( SERVER + 'user/pw/', {
        method: 'PATCH', 
        mode:"cors",
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-access-token' : USER.token
        },
        body: JSON.stringify( pwobj )
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
    create,
    find,
    get,
    update,
    del,
    setUser,
    getUser,
    sendMail,
    login,
    logout,
    picUpload,
    pwChange
}
export default userApi; 