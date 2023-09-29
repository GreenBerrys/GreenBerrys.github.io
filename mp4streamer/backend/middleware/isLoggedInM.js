
/********************************************************************************* 
 * isLoggedInM() - check if user logged in
 */
const AUTOLOGIN = `${process.env.s_AUTOLOGIN}`.toLowerCase() === 'true' ? true : false;

const isLoggedIn = ( req, res, next ) => {

    try{
       
        if( !AUTOLOGIN && !req.session.userid ){

            return res.status( 403 ).send( "Access denied!");
        }
        
        next();
    }   
    catch( error ){
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
}
export default{

    isLoggedIn,
}
