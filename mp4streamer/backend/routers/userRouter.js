import express from "express";
import user from "../controllers/userController.js"
//import isL from "../middleware/isLoggedInM.js"

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
 * unknown path
 */
 router.use( "*", notFound );
 // -------------------------------------------------------------------------------
 async function notFound( req, res ){
     return res.status( 404 ).send('Seite nicht gefunden');
 }
 
 export default router;
