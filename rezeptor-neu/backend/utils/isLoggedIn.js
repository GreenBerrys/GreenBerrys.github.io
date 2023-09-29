/********************************************************************************* 
 * isLoggedIn() - check if user logged in
 */
 async function isLoggedIn( req, res ){

    if ( req.session.userid ){

        return true;

    }
    else{

        return false;
    }
}
export default{

    isLoggedIn,
}