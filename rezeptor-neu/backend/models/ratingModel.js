/********************************************************************************* 
 * Ratings
 */
 import mongoose from "mongoose";

 const RatingSchema = mongoose.Schema({

    recipeid: { 
        //type: mongoose.Schema.Types.ObjectId,// ref: "recipe", 
        type: String,
        required: [ true, '[61]##Recipe id required' ]
    },
    userid: { 
        //type: mongoose.Schema.Types.ObjectId, ref: "user", 
        type: String,
        required: [ true, '[60]##Author id required' ]
    },
    rate:{
        type: Number,
        required: [ true, '[10]##Rating value required' ],
		min: [ 0, '[11]##Rating value: minimum is 0' ],
		max: [ 5, '[12]##Rating value maximum is 5' ]
    }
}, { versionKey: false }).index( { recipeid: 1, userid: 1 }, { unique: true } );


const Rating = mongoose.model("rating", RatingSchema);

/********************************************************************************* 
 * create() - add new rating
 * 
 * ratingObj = see RatingSchema
 */
 async function create ( ratingObj ) {

    return await Rating.create( ratingObj );
}
/********************************************************************************* 
 * getById() - get a rating by id
 */
 async function getById ( id ) { 
    return await Rating.findById( id );
}
/********************************************************************************* 
 * count - count search results
 */
 async function count( { recipeid, userid } ){ 

	let search = {};
  
    // ** Search for recipe
    if( recipeid ) {
        search[ 'recipeid' ] = recipeid; 
    }
    // ** Search for author 
    if( userid ) {
        search[ 'userid' ] = userid; 
    }
	return  await Rating.count( search );
}
/********************************************************************************* 
 * find - find comments by recipe, author and/or text
 */
 async function find( { recipeid, userid }, pageNo = 0, pageSize = process.env.s_PAGESIZE ) { 

	let search = {};
  
    // ** Search for recipe
    if( recipeid ) {
        search[ 'recipeid' ] = recipeid; 
    }
    // ** Search for author 
    if( userid ) {
        search[ 'userid' ] = userid; 
    }
	return  await Rating.find( search, { locked: 0 } )
                        .skip( pageNo * pageSize ).limit( pageSize )
                        //.populate( { path: 'author', select: 'name' } )           
                        //.populate( { path: 'recipe', select: 'name' } );
}
/********************************************************************************* 
 * update() - update rating by id
 * 
 * ratingObj = see RatingSchema
 */
 async function update ( id, ratingObj ) {
    return await Rating.findOneAndUpdate( { _id: id }, { $set: ratingObj }, { new: true } );
}
/********************************************************************************* 
 * del() - delete rating by id  
 */
 async function del ( id ) { 
    return await Rating.findOneAndDelete( { _id: id } ); 
}
/********************************************************************************* 
 * delRecipeRatings() - delete all ratings from recipe  
 */
async function delRecipeRatings( recipeID ) { 
    
    return await Rating.deleteMany( { 'recipeid' : recipeID } ); 
}
/********************************************************************************* 
 * average() - get average ratings 
 */
 async function average ( id ) {

    const avg = { users: 0, avgRate: 0 };
    
    const found = await Rating.aggregate([ 

         { $match: { recipeid: id  } },
         { $group: { _id: null, users: { $sum: 1 }, avgRate: { $avg: '$rate' } } }
    ]);

    if( found.length > 0 ){
       avg.users = found[0].users;
       avg.avgRate = Math.round( found[0].avgRate * 100 ) / 100;
    }
    return avg;

    /*
    // ** For using with objectid's (don't works with $match) -----------------------------
    const found = await Rating.find({recipe: id},{ rate:1, _id:0 })
    const avg = { users: found.length, avgRate: found.reduce((acc, {rate}, ind) => 
        {
            acc += rate;
            if ( ind === found.length -1 )
                return Math.round( acc / found.length * 100 ) / 100 ;
            else
                return acc;   
        }, 0 )
    };
    console.log(avg);
    return avg;
    // -------------------------------------------------------------------------------------
    */
}

export default {
    create,
    getById,
    count,
    find,
    update,
    del,
    average,
    delRecipeRatings
  };
  