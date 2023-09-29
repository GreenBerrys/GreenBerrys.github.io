const jail = [];

/********************************************************************************* 
 * lockUp() - add IP to jail 
 */
const lockUp = ( req ) => {

    const IP = req.header( 'x-clientip' ) || req.connection.remoteAddress || req.ip;
    jail[IP] = ( new Date() ).getMinutes();
    return;
}
/********************************************************************************* 
 * isInJail() - check if IP is blocked
 */
const isInJail = ( req ) => {
    
    const IP = req.header( 'x-clientip' ) || req.connection.remoteAddress || req.ip;

    if( jail[IP] ){

        if ( ( ( new Date() ).getMinutes() - jail[IP] ) < 10 ){
           return true; 
        }
        delete jail[IP]; 
    }
    return false;
}

export default{

    isInJail,
    lockUp
}