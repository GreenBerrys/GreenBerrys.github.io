/********************************************************************************* 
 * userErrMsg() cut userdefined errormessages (delimited by '##')    (i.e. database validation errors)
 */
 const userErrMsg = ( msg ) => msg.includes( '##' ) ? msg.substring( msg.lastIndexOf( '##' ) +2 ) : msg;

/********************************************************************************* 
 * retObj() build json-object for returning 
 */
 const retObj = ( err, resultObj, { error, type, msg }, page = -1, lastPage = -1, count = -1 ) => {    

    if ( err ){

        // ****** Database errors ******
        if ( error ){   

            //* Parse my own errorcodes
            const intErr = error.message.includes( '[' ) ? parseInt( error.message.substr( error.message.lastIndexOf( '[' ) +1 ) ) * -1 : -1;

            return { 

                error: true,
                errCode: error.code || intErr,
                errType: error.code ? "Database" : error.name,
                errMsg: error.code ? error.message : userErrMsg( error.message ),
                result: resultObj 
            } 
        }// ****** Program errors *******
        else{            

            //* Parse my own errorcodes
            const intErr = msg.includes( '[' ) ? parseInt( msg.substr( msg.lastIndexOf( '[' ) +1 ) ) * -1 : -1;
            return { error: true, errCode: intErr, errType: type, errMsg: userErrMsg(msg), result: resultObj };
        }        
    }
    else{   // ****** No error - returning result *******

        const retObj =  { error: false };
        // ** returning page, no of lastPage & sum of found records for find-operations
        if ( count !== -1 ) { 
            retObj.page = page; 
            retObj.lastPage = lastPage; 
            retObj.count = count;
        }; 
        retObj.result = resultObj;
        return retObj;
    }
}
export default{

    retObj
}