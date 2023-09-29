/********************************************************************************* 
 * Comments
 */
 import mongoose from "mongoose";

 const CommentSchema = mongoose.Schema({

    recipe: { 
        type: mongoose.Schema.Types.ObjectId, ref: "recipe", 
        index: true,
        required: [ true, '[61]##Recipe id required' ]
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, ref: "user", 
        index: true,
        required: [ true, '[60]##Author id required' ]
    },
    written:{
        type: Date,
        default: null
    },
    text: {
        type: String,
        default: ""
    },
    locked: { 
        type: Boolean, 
        default: false
    }
}, { versionKey: false });

const Comment = mongoose.model("comment", CommentSchema);

/********************************************************************************* 
 * create() - add new comment
 * 
 * commentObj = see CommenttSchema
 */
 async function create ( commentObj ) {
    return await Comment.create( commentObj );
}
/********************************************************************************* 
 * getById() - get a comment by id
 */
 async function getById ( id ) { 
    return await Comment.findById( id );
}
/********************************************************************************* 
 * count - count search results
 */
 async function count( { recipe, author,  text } ){ 

	let search = {};
  
    // ** Search for recipe
    if( recipe ) {
        search[ 'recipe' ] = recipe; 
    }
    // ** Search for author 
    if( author ) {
        search[ 'author' ] = author; 
    }
    // ** Search for text 
    if( text ) {
        text[0] === '*' ? search[ 'text' ] = { $regex: text.substr( 1 ), $options: "i" } 
                        : search[ 'text' ] = { $regex: "^" + text, $options: "i" } 
    }	
	return  await Comment.count( search );
}
/********************************************************************************* 
 * find - find comments by recipe, author and/or text
 */
 async function find( { recipe, author, text }, pageNo = 0, pageSize = process.env.s_PAGESIZE ) { 

	let search = {};
  
    // ** Search for recipe
    if( recipe ) {
        search[ 'recipe' ] = recipe; 
    }
    // ** Search for author 
    if( author ) {
        search[ 'author' ] = author; 
    }
    // ** Search for text 
    if( text ) {
        text[0] === '*' ? search[ 'text' ] = { $regex: text.substr( 1 ), $options: "i" } 
                        : search[ 'text' ] = { $regex: "^" + text, $options: "i" } 
    }	
	return  await Comment.find( search, { locked: 0 } )
                         .skip( pageNo * pageSize ).limit( pageSize )
                         .populate( { path: 'author', select: ['name', 'description', 'picTime'] } )           
                         .populate( { path: 'recipe', select: 'name' } );
}
/********************************************************************************* 
 * update() - update comment data by id
 * 
 * commentObj = see CommentSchema
 */
 async function update ( id, commentObj ) {
    return await Comment.findOneAndUpdate( { _id: id }, { $set: commentObj }, { new: true } );
}
/********************************************************************************* 
 * del() - delete comment by id  
 */
 async function del ( id ) { 
    return await Comment.findOneAndDelete( { _id: id } ); 
}
/********************************************************************************* 
 * delRecipeComments() - delete all comments from recipe  
 */
async function delRecipeComments( recipeID ) { 
    
    return await Comment.deleteMany( { 'recipe' : recipeID } ); 
}

/********************************************************************************* 
 * count() - count comments for a recipe
 */
 async function commentCount ( recipeId ) { 
    return await Comment.count( { recipe: recipeId } );
}

export default {
    create,
    getById,
    count,
    find,
    update,
    del,
    commentCount,
    delRecipeComments
  };
  