import express from "express";
import user from "../controllers/userController.js"
import isL from "../middleware/isLoggedInM.js"


const router = express.Router();

/********************************************************************************* 
 * login
 */ 
router.post( "/login", user.login );
 /********************************************************************************* 
 * logout
 */ 
router.post( "/logout", user.logout );
/********************************************************************************* 
 * sendMail send activation mail to user
 */ 
router.post( "/sendmail", user.sendActivationMail );
/********************************************************************************* 
 * set user picture
 */ 
router.post( "/picture", isL.isLoggedInM, user.setPic );   
router.post( "/picture/*", isL.isLoggedInM, user.setPic );   
/********************************************************************************* 
 * create new user
 */ 
router.post( "/", user.create );
/********************************************************************************* 
 * get user picture
 */ 
 router.get( "/picture/*", user.getPic );   
 router.get( "/picture", user.getPic );   
 /********************************************************************************* 
 * activate user account
 */ 
router.get( "/activate/*", user.activate );   
/********************************************************************************* 
 * find users by name and/or mail
 */ 
router.get( "/find", user.find );   
 /********************************************************************************* 
 * get user by id, name or mail
 */ 
router.get( "/", isL.isLoggedInM, user.get );   
/********************************************************************************* 
 * change password
 */ 
 router.patch( "/pw", isL.isLoggedInM, user.pwChange );
 /********************************************************************************* 
 * patch userdata
 */ 
router.patch( "/", isL.isLoggedInM, user.update );
/********************************************************************************* 
 * delete user
 */ 
router.delete( "/", isL.isLoggedInM, user.del );
/********************************************************************************* 
 * unknown path
 */
 router.use( "*", notFound );
 // -------------------------------------------------------------------------------
 async function notFound( req, res ){
     return res.status( 404 ).sendFile( 'urlNotFound.html' , { root: './default/' } );
 }
 
 export default router;
