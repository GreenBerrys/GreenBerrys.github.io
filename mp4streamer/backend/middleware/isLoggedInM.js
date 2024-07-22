
/********************************************************************************* 
 * isLoggedInM() - check if user logged in
 */
const AUTOLOGIN = `${process.env.s_AUTOLOGIN}`.toLowerCase() === 'true' ? true : false;

const isLoggedIn = ( req, res, next ) => {

    try{

        if( !AUTOLOGIN && !req.session.userid ){

            res.status( 403 ).json( { error: true, errMsg: "Access denied!", result: [] } );
            return;
        }
        // write something in the session cookie so that the cookie will be sent. 
        req.session.Magic = Math.floor(Date.now() / 0x60e3 );
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
