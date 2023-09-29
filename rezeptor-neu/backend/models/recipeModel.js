/********************************************************************************* 
 * Recipes
 */
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RecipeSchema = mongoose.Schema({

    name:{
        type: String,
		index: true,
        unique: true,
        required: [ true, '[20]##Recipe name required' ]
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, ref: "user", 
        required: [ true, '[21]##Author id required' ]
    },
    description: {
        type: String,
        maxLength: [ 256, '[22]##Description: maximum length 256 Characters' ],
        default: ""
    },    
    portions: {
        type: Number,
        default: 1
    },    
    instruction: {
        type: String,
        maxLength: [ 1024 * 16, '[23]##Instruction: maximum length 16k' ],
        default: ""
    },    
    time: {
        prepare: { type: Number, default: 0 },
        cook: { type: Number, default: 0 }
    },
    keywords: {
        type: String,
        default: ""
    },
    ingredients: [ { 
        _id: false, 
        ingRef: { type: mongoose.Schema.Types.ObjectId, ref: "ingredient" }, 
        quantity: { type: Number, default: 0.0 }, 
        unit: { type: String, default: "" },
        note: { type: String, default: "" },
        }
    ],
    ratings: { 
        users: {type: Number, default: 0},
        avgRate: {type: Number, default: 0}
    },
    comments: {
        type: Number,
        default: 0
    },
    locked: { 
		type: Boolean, 
		default: false
	},
    deleted: { 
		type: Boolean, 
		default: false
	},
    picTime: {
        type: String,
        default: "" 
    },
    picture: {
		contentType: { type: String, default: "" },
		data: { type: Buffer, default: null } 
    },  

}, { versionKey: false });

const Recipe = mongoose.model("recipe", RecipeSchema);

/********************************************************************************* 
 * create() - create new recipe
 * 
 * recipeObj = see RecipeSchema  
 */
async function create ( recipeObj ){

    return await Recipe.create( recipeObj );
}
/********************************************************************************* 
 * getByName() - get the first recipe by exact name 
 *
 */
 async function getByName ( name, full = false ) {
  
    if ( !full ){
        return await Recipe.findOne( { name: name }, { locked: 0, picture: 0, deleted: 0 } )
                           .collation( { locale: "de" , strength: 1 } )
                           .populate( { path: 'author', select: ['name', 'picTime'] } )           
                           .populate( { path: 'ingredients.ingRef', select: 'name' }  );
            }
    else{
        return await Recipe.findOne( { name: name } )
                          .collation( { locale: "de" , strength: 1 } )
                          .populate( { path: 'author', select: ['name', 'picTime'] } )           
                          .populate( { path: 'ingredients.ingRef', select: 'name' }  );
    }                 
}
/********************************************************************************* 
 * getById() - get a recipe by id
 */
 async function getById ( recipeid, full = false ) { 
  
    if( !full ){
        return await Recipe.findById( recipeid, { locked: 0, picture: 0, deleted: 0 } )
                        .populate( { path: 'author', select: ['name', 'picTime'] } )
                        .populate( { path: 'ingredients.ingRef', select: 'name' }  );
    }    
    else{
        return await Recipe.findById( recipeid )
                        .populate( { path: 'author', select: ['name', 'picTime'] } )           
                        .populate( { path: 'ingredients.ingRef', select: 'name' }  );
    }    
}
/********************************************************************************* 
 * count() - count search results
 */
 async function count( { name, author, country, category, description, instruktion, keyword, ingredient } ) { 

	let search = { deleted: false };
  
    // ** Search for name 
    if( name ) {
      	name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
        	            : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
	}
    // ** Search for description
    if( description ) {
		description[0] === '*' ? search[ 'description' ] = { $regex: description.substr( 1 ), $options: "i" } 
						       : search[ 'description' ] = { $regex: "^" + description, $options: "i" } 
	}
    // ** Search for author 
    if( author ) {
        search[ 'author' ] = author; 
    }
    // ** Search for country 
    if( country ) {
        search[ 'country' ] = country; 
    }
    // ** Search for category 
    if( category ) {
        search[ 'category' ] = category; 
    }
    // ** Search for keyword
    if( keyword ) {
		keyword[0] === '*' ? search[ 'keywords' ] = { $regex: keyword.substr( 1 ), $options: "i" } 
				           : search[ 'keywords' ] = { $regex: "^" + keyword, $options: "i" } 
	}
    // ** Search for instruktion
    if( instruktion ) {
		instruktion[0] === '*' ? search[ 'instruktion' ] = { $regex: instruktion.substr( 1 ), $options: "i" } 
				               : search[ 'instruktion' ] = { $regex: "^" + instruktion, $options: "i" } 
	}
    // ** Search for ingredient 
    if( ingredient ) {
        search[ 'ingredients.ingRef' ] =  ingredient; 
    }
	return  await Recipe.count( search );
}
/********************************************************************************* 
 * find() - find recipes by name, author, country, category, ingredient and/or description
 * 
 */
 async function find( { name, author, country, category, description, instruktion, keyword, ingredient }, pageNo = 0, pageSize = process.env.s_PAGESIZE ) { 

	let search = { deleted: false };
  
    // ** Search for name 
    if( name ) {
        name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
                      : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
    }
    // ** Search for description
    if( description ) {
        description[0] === '*' ? search[ 'description' ] = { $regex: description.substr( 1 ), $options: "i" } 
                                : search[ 'description' ] = { $regex: "^" + description, $options: "i" } 
    }
    // ** Search for author 
    if( author ) {
        search[ 'author' ] = author; 
    }
    // ** Search for country 
    if( country ) {
        search[ 'country' ] = country; 
    }
    // ** Search for category 
    if( category ) {
        search[ 'category' ] = category; 
    }
    // ** Search for keyword
    if( keyword ) {
        keyword[0] === '*' ? search[ 'keywords' ] = { $regex: keyword.substr( 1 ), $options: "i" } 
                            : search[ 'keywords' ] = { $regex: "^" + keyword, $options: "i" } 
    }
    // ** Search for instruktion
    if( instruktion ) {
        instruktion[0] === '*' ? search[ 'instruktion' ] = { $regex: instruktion.substr( 1 ), $options: "i" } 
                                : search[ 'instruktion' ] = { $regex: "^" + instruktion, $options: "i" } 
    }
    // ** Search for ingredient 
    if( ingredient ) {
        search[ 'ingredients.ingRef' ] =  ingredient; 
    }
    return  await Recipe.find( search, { locked: 0, picture: 0, deleted: 0 } )
                        .skip( pageNo * pageSize ).limit( pageSize )
                        .populate( { path: 'author', select: ['name', 'picTime'] } )           
                        .populate( { path: 'ingredients.ingRef', select: 'name' } );
}
/********************************************************************************* 
 * update() - update recipe by id
 * 
 * recipeObj = see RecipeSchema
 */
 async function update ( id, RecipeObj ) {

  return await Recipe.findOneAndUpdate( { _id: id }, { $set: RecipeObj }, { new: true } )
                     .select( { locked: 0, picture: 0, deleted: 0 } );
}
/********************************************************************************* 
 * del() - delete a recipe by id
 */
 async function del ( id ) { 
  return await Recipe.findOneAndDelete({ _id: id })
                     .select( { locked: 0, picture: 0, deleted: 0 } );
}
/********************************************************************************* 
 * checkRef() - find the first recipes using a country, category or ingredient
 * 
 */
 async function checkRef( { country, category, author, ingredient } ) { 

	let search = {};
  
    // ** Search for country 
    if( country ) {
        search[ 'country' ] = country; 
    }
    // ** Search for category 
    if( category ) {
        search[ 'category' ] = category; 
    }
    // ** Search for author 
    if( author ) {
        search[ 'author' ] =  author; 
    }
    // ** Search for ingredient 
    if( ingredient ) {
        search[ 'ingredients.ingRef' ] =  ingredient; 
    }
	return  await Recipe.findOne( search );
}

export default {
    create,
    getByName,
    getById,
    count,
    find,
    update,
    del,
    checkRef
};
