import express from "express";
import recipe from "../controllers/recipeController.js"
import isL from "../middleware/isLoggedInM.js"
import * as p from"../utils/path.js";

const router = express.Router();

/********************************************************************************* 
 * set recipe picture
 */ 
router.post( "/picture", isL.isLoggedInM, recipe.setPic );   
router.post( "/picture/*", isL.isLoggedInM, recipe.setPic );   
/********************************************************************************* 
 * create new recipe
 */ 
router.post( "/", isL.isLoggedInM, recipe.create );
/********************************************************************************* 
 * get recipe picture
 */ 
router.get( "/picture/*", recipe.getPic );   
router.get( "/picture", recipe.getPic );   
/********************************************************************************* 
 * find recipes by name, author, country, category and/or description
 */ 
router.get( "/find", recipe.find );   
/********************************************************************************* 
 * get recipe by id or name
 */ 
router.get( "/", recipe.get );

router.get( "/*", (req, res) =>{

    res.sendFile( 'index.html', { root: p.buildPath() } );
    return;
} );
/********************************************************************************* 
 * patch recipe data
 */ 
router.patch( "/", isL.isLoggedInM, recipe.update );
/********************************************************************************* 
 * delete recipe
 */ 
router.delete( "/", isL.isLoggedInM, recipe.del );
/********************************************************************************* 
 * unknown path
 */
router.use( "*", notFound );
// -------------------------------------------------------------------------------
async function notFound( req, res ){
    console.log("NotFound\n", req.url,'\n',req.originalUrl)
    return res.status( 404 ).sendFile( 'urlNotFound.html' , { root: './default/' } );
}

export default router;
