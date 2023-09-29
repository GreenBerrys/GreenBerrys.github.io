import express from "express";
import ingredient from "../controllers/ingredientController.js"
import isL from "../middleware/isLoggedInM.js"

const router = express.Router();

/********************************************************************************* 
 * create new ingredient
 */ 
router.post( "/", isL.isLoggedInM, ingredient.create );
/********************************************************************************* 
 * find ingredients by name 
 */ 
router.get( "/find", ingredient.find );   
/********************************************************************************* 
 * get ingredient by id or name
 */ 
router.get( "/", ingredient.get );   
/********************************************************************************* 
 * patch ingredient data
 */ 
router.patch( "/", isL.isLoggedInM, ingredient.update );
/********************************************************************************* 
 * delete ingredient
 */ 
router.delete( "/", isL.isLoggedInM, ingredient.del );
/********************************************************************************* 
 * unknown path
 */
 router.use( "*", notFound );
 // -------------------------------------------------------------------------------
 async function notFound( req, res ){
     return res.status( 404 ).sendFile( 'urlNotFound.html' , { root: './default/' } );
 }
 
 export default router;
