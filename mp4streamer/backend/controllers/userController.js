/********************************************************************************* 
 * User Controller
 */
import jail from "../utils/jail.js";
import log from "../utils/logger.js";

/********************************************************************************* 
 * checkAttempts() - count user login attempts 
 */
const checkAttempts = ( req ) => {

    // ** Check if more then 3 attempts
    if ( req.session.attempt ) {
        
        req.session.attempt++;
        if( req.session.attempt > 3 ){

            jail.lockUp( req );
            log.logger( "--> jailed", req );
            return true;
        }
    }    
    else{
        req.session.attempt = 1;
    }
    return false;
}
/********************************************************************************* 
 * edit() - user edit status
 */
const edit = ( req, res ) => {
    return res.status( 200 ).json( { error: false, result: [{ edit: req.session.edit }] } );
}
/********************************************************************************* 
 * logout() - user logout 
 */
async function logout( req, res )  {

    try{    
        
        if( req.session.userid ){
            // req.session.destroy();
            req.session = null;
        }

        log.logger( "Logout", req );
        return res.status( 200 ).json( { error: false, result: [] } ); 
    }
    catch( error ){
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
 }
/********************************************************************************* 
 * login() - user login 
 */
async function login( req, res ) {

    // ** Check if already logged in
    if( req.session.userid ){
        return res.status( 200 ).json( { error: false, result: [] } ); 
    }

    // ** Check if user is in jail
    if( jail.isInJail( req  ) ){
        return res.status( 403 ).json( { error: true, errMsg: "Zu viele Login-Versuche! \n Deine IP wurde vorübergehend gesperrt.", result: [] } ); 
    }
    try{
        
        // ** Check username
        const userNo = `${process.env.s_USER}`.split(',').findIndex( (user) => req.body.user === user.trim() );
        if( userNo === -1 ){

            // ** Check if more then 3 attempts
            if ( checkAttempts( req ) ) {
                return res.status( 403 ).json( { error: true, errMsg: "Zu viele Login-Versuche!", result: [] } ); 
            }   
            log.logger( "--> wrong username", req );
            return res.status( 403 ).json( { error: true, errMsg: "Username oder Password ungültig!", result: [] } ); 
        }
        // ** check password
        
        if( `${process.env.s_PASS}`.split(',')[ userNo ].trim() !== req.body.password ){

            // ** Check if more then 3 attempts
            if ( checkAttempts( req ) ) {
                return res.status( 403 ).json( { error: true, errMsg: "Zu viele Login-Versuche!", result: [] } ); 
            }    
            log.logger( "--> wrong password", req );
            return res.status( 403 ).json( { error: true, errMsg: "Username oder Password ungültig!", result: [] } ); 
        }
        // ** OK - login..
        req.session.userid = req.body.user;
        const edit = `${process.env.s_EDIT}`.split(',')[ userNo ].trim();
        
        req.session.edit = edit.toLocaleLowerCase() === 'true' ? true : false;
        const user = `${process.env.s_USER}`.split(',')[ userNo ].trim();
        log.logger( `Login User "${user}" Edit=${edit}`, req );

        return res.status(200).json( { error: false, result: [ { edit: req.session.edit } ] } );
    }
    catch( error ){
        res.status( 400 ).json( { error: true, errMsg: error.message, result: [] } ); 
        return;
    }
 }
 export default {

    login,
    logout,
    edit
}
