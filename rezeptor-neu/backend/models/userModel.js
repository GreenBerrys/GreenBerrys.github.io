/********************************************************************************* 
 * User Model 
 */
 import mongoose from "mongoose";

const UserSchema = mongoose.Schema({

    name: { 
		type: String,  
		required: [ true, '[10]##Name required' ],
		minLength: [ 3, '[11]##Name: minimum length 3 characters' ],
		maxLength: [ 30, '[12]##Name: maximum length 30 characters' ]
	},	
    description: {
        type: String,
		maxLength: [ 40, '[13]##Description: maximum length 40 characters' ],
        default: ""
    },
    email: { 
		type: String, 
		index: true,
		unique: true,
		required: [ true, '[14]##Email-address required' ]
 	},
	role: { 
		type: String, 
		default: 'user', 
		enum: { 
			values: [ 'user', 'admin' ], 
			message: `[15]##Role '{VALUE}' unknown role` 
		}	
	},
    password: { 
		type: String, 
		required: [ true, '[16]##Password required' ],
		minLength: [ 8, '[17]##Password: minimum length 8 characters' ]
	},
	lastLogin: { 
		type: Date, 
		default: null
	},
    verified: { 
		type: Date, 
		default: null
	},
    lastIp: { 
		type: String, 
		default: ""
	},
    locked: { 
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
	}
}, { versionKey: false });

const User = mongoose.model("user", UserSchema);
/********************************************************************************* 
 * create() - create new user
 * 
 * userObj = see UserSchema
 */
 async function create( userObj ) {
	
    return await User.create( userObj );
}
/********************************************************************************* 
 * getByName() - get the first user by exact name (case insensitiv)
 *
 */
 async function getByName ( name ) {
	return await User.findOne( { name: name }, { name: 1, description: 1, picTime: 1 } ).collation( { locale: "de" , strength: 1 } ); 
}
/********************************************************************************* 
 * getById() - get user by id
 */
 async function getById( userid, full = false ) {
    if( !full ) 
	    return await User.findById( userid, { name: 1, description: 1, email: 1, picTime: 1 } );
    else
        return await User.findById( userid );
}
/********************************************************************************* 
 * getByEmail() - get user by email-address (case insensitiv)
 */
 async function getByEmail( emailAddress, full = false ) {
    if( !full ) 
	    return await User.findOne( { email: emailAddress }, { name: 1, description: 1, email: 1 } ).collation( { locale: "en" , strength: 1 } );
    else
        return await User.findOne( { email: emailAddress } ).collation( { locale: "en" , strength: 1 } );
}
/********************************************************************************* 
 * count() - count search results
 */
async function count( { name, email, description } ){

	let search = {};
  
    // ** Search for name 
    if( name ) {
      	name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
        	            : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
	}	
    // ** Search for email
    if( email ) {
		email[0] === '*' ? search[ 'email' ] = { $regex: email.substr( 1 ), $options: "i" } 
						 : search[ 'email' ] = { $regex: "^" + email, $options: "i" } 
	}
    // ** Search for description
    if( description ) {
		description[0] === '*' ? search[ 'description' ] = { $regex: description.substr( 1 ), $options: "i" } 
						       : search[ 'description' ] = { $regex: "^" + description, $options: "i" } 
	}
    return await User.count( search );
}
/********************************************************************************* 
 * find() - find users by Name and/or email address (case insensitiv)
 * 
 */
async function find( { name, email, description }, pageNo = 0, pageSize = process.env.s_PAGESIZE ) { 

	let search = {};
  
    // ** Search for name 
    if( name ) {
      	name[0] === '*' ? search[ 'name' ] = { $regex: name.substr( 1 ), $options: "i" } 
        	            : search[ 'name' ] = { $regex: "^" + name, $options: "i" } 
	}	
    // ** Search for email
    if( email ) {
		email[0] === '*' ? search[ 'email' ] = { $regex: email.substr( 1 ), $options: "i" } 
						 : search[ 'email' ] = { $regex: "^" + email, $options: "i" } 
	}
    // ** Search for description
    if( description ) {
		description[0] === '*' ? search[ 'description' ] = { $regex: description.substr( 1 ), $options: "i" } 
						       : search[ 'description' ] = { $regex: "^" + description, $options: "i" } 
	}
	return  await User.find( search, { name: 1, description: 1, picTime: 1 } ).skip( pageNo * pageSize ).limit( pageSize );
}
/********************************************************************************* 
 * update() - update user data by id
 * 
 * UserObj = see UserSchema
 */
 async function update( id, userObj ) {
    return await User.findOneAndUpdate( { _id: id }, { $set: userObj }, { new: true } )
                     .select( { name: 1, description: 1, email: 1, picTime: 1 } );
}
/********************************************************************************* 
 * del() - delete user by ID 
 */
 async function del( userid ) { 
	return await User.findOneAndDelete( { _id: userid } ); 
}
/********************************************************************************* 
 * setVerified() - write the current date & time to the verified-field
 */
 async function setVerified( userid ){
	return await User.findOneAndUpdate( { _id: userid }, { 
		$set: { verified: Date.now() } }, { new: true } );
}
/********************************************************************************* 
 * setLastLogin() - write the current date & time to the lastLogin-field
 */
 async function setLastLogin( userid ){
	return await User.findOneAndUpdate( { _id: userid }, { 
		$set: { lastLogin: Date.now() } }, { new: true } );

}
/********************************************************************************* 
 * setLastIp() - write the current client-IP to the lastIp-field
 */
 async function setLastIp( userid, req ){
	
	const IP = req.header( 'x-clientip' ) || req.connection.remoteAddress || req.ip;

	return await User.findOneAndUpdate( { _id: userid }, { 
		$set: { lastIp: IP } }, { new: true } );
}

export default {
	create,
	getByName,
	getById,
	getByEmail,
    count,
	find,
	update,
	del,
	setVerified,
	setLastLogin,
	setLastIp
};
