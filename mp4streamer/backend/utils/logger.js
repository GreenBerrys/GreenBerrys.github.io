/********************************************************************************* 
 * logger() - write message in Log-file
 */
function logger( msg, req ){

    let ip = `${ req.header( 'x-clientip' ) || req.connection.remoteAddress }`;

    if ( ip.includes( '.' ) ){
        let tmp = "";
        for( let str of ip.split( '.' ) )
           tmp += str.length < 3 ? ' '.repeat( 3 - str.length ) + str + '.' : str + '.';
        ip = tmp.substring( 0, tmp.length-1 );   
    }
    if( ip.length < 22 )
      ip = ' '.repeat( 22 - ip.length ) + ip;

    console.error(

        new Date().toLocaleString(), " ", 
        //"Session-Id:",req.session.id,
        `IP: ${ip} `, 
        //`Path: "${req.originalUrl}" >`,
        msg 
    );
    return
}

export default{

    logger
}