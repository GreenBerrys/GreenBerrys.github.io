
/********************************************************************************* 
 * ERROR() - Create error-object
 */
/*
const ERROR = (errMsg, errCode) => { 
    
    let err = new Error( errMsg ); 
    err.httpStatusCode = errCode;
    return err;
}
*/
/********************************************************************************* 
 * logger() - write message in Log-file
 */
function logger( msg, req ){

    console.error(

        //new Date().toLocaleString(), "|", 
        //"Session-Id:",req.session.id,
        //`IP: ${req.header( 'x-clientip' ) || req.connection.remoteAddress} |`, 
        //`Path: "${req.originalUrl}" >`,
        msg 
    );
    return
}

export default{

    logger
}