/********************************************************************************* 
 * Ingredients
 */
 import mongoose from "mongoose";

 const IngredientSchema = mongoose.Schema({

    name: {
        type: String,
        required: [ true, '[50]##Ingredient name required' ],
        index: true,
        unique: true
    },
    unit: {
        type: String,
        default: ""
    },    
    category: {
        type: String,
        default: ""
    },
    locked: { 
        type: Boolean, 
        default: false
    }
}, { versionKey: false });

const Ingredient = mongoose.model("ingredient", IngredientSchema);

/********************************************************************************* 
 * create() - add new ingredient
 * 
 * ingredientObj = see IngredientSchema
 */
 async function create ( ingredientObj ) {
    return await Ingredient.create( ingredientObj );
}
/********************************************************************************* 
 * getByName() - get the first ingredient by exact name 
 */
 async function getByName ( name , caseInsensitiv = true) {

    if( caseInsensitiv )
        return await Ingredient.findOne( { name: name } ).collation( { locale: "de" , strength: 1 } ); 
    else
        return await Ingredient.findOne( { name: name } ); 
}
/********************************************************************************* 
 * getById() - get an ingredient by id
 */
 async function getById ( id ) { 
    return await Ingredient.findById( id );
}
/********************************************************************************* 
 * count - count search results
 */
 async function count( { name, unit, category } ){ 

	let search = {};
  
    // ** Search for name 
    if( name ) {
      	name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
        	            : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
	}	
    // ** Search for unit 
    if( unit ) {
        unit[0] === '*' ? search[ 'unit' ] = { $regex: unit.substr( 1 ), $options: "i" } 
                        : search[ 'unit' ] = { $regex: "^" + unit, $options: "i" } 
    }	
    // ** Search for category
    if( category ) {
		category[0] === '*' ? search[ 'category' ] = { $regex: category.substr( 1 ), $options: "i" } 
						    : search[ 'category' ] = { $regex: "^" + category, $options: "i" } 
	}
	return  await Ingredient.count( search );
}
/********************************************************************************* 
 * find - find ingredients by name, unit and/or category
 */
 async function find( { name, unit, category }, pageNo = 0, pageSize = process.env.s_PAGESIZE ) { 

	let search = {};
  
    // ** Search for name 
    if( name ) {
      	name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
        	            : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
	}	
    // ** Search for unit 
    if( unit ) {
        unit[0] === '*' ? search[ 'unit' ] = { $regex: unit.substr( 1 ), $options: "i" } 
                        : search[ 'unit' ] = { $regex: "^" + unit, $options: "i" } 
    }	
    // ** Search for category
    if( category ) {
		category[0] === '*' ? search[ 'category' ] = { $regex: category.substr( 1 ), $options: "i" } 
						    : search[ 'category' ] = { $regex: "^" + category, $options: "i" } 
	}
	return  await Ingredient.find( search, { locked: 0 } ).skip( pageNo * pageSize ).limit( pageSize );
}
/********************************************************************************* 
 * update() - update ingredient data by id
 * 
 * ingredientObj = see IngredientSchema
 */
 async function update ( id, ingredientObj ) {
    return await Ingredient.findOneAndUpdate( { _id: id }, { $set: ingredientObj }, { new: true } );
}
/********************************************************************************* 
 * del() - delete ingredient by id  
 */
 async function del ( id ) { 
    return await Ingredient.findOneAndDelete( { _id: id } ); 
}

export default {
    create,
    getByName,
    getById,
    count,
    find,
    update,
    del
  };
  