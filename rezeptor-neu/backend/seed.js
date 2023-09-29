import mongoose from "mongoose";
import database from "./database/mongodb.js";
import fs from "fs";
import dotenv from "dotenv";
import { json } from "express";
import { time } from "console";
import bcrypt from "bcrypt";

dotenv.config( { path: "./server.env" } );
const ENCRYPT = `${process.env.s_PWENCRYPT}` === 'true' ? true : false;

/********************************************************************************* 
 * Ingredients
 */

 const IngredientSchema = mongoose.Schema({

    name: {
        type: String,
        required: [ true, '##Ingredientname required' ],
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
 * Users 
 */
 const UserSchema = mongoose.Schema({

    name: { 
		type: String,  
		required: [ true, '##Name required' ],
		minLength: [ 3, '##Name: minimum length 3 characters' ],
		maxLength: [ 30, '##Name: maximum length 30 characters' ]
	},	
    description: {
        type: String,
        default: ""
    },
    email: { 
		type: String, 
		index: true,
		unique: true,
		required: [ true, '##Email-address required' ]
 	},
	role: { 
		type: String, 
		default: 'user', 
		enum: { 
			values: [ 'user', 'admin' ], 
			message: `##Role '{VALUE}' not allowed` 
		}	
	},
    password: { 
		type: String, 
		required: [ true, '##Password required' ]
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
        contentType: String,
		data: Buffer
	}
}, { versionKey: false });
const User = mongoose.model( "user", UserSchema );

/********************************************************************************* 
 * Recipes
 */
 const RecipeSchema = mongoose.Schema({

    name:{
        type: String,
        required: [ true, '##recipename required' ]
    },
    author: { 

        type: mongoose.Schema.Types.ObjectId, ref: "user", 
        required: [ true, '##authorid required' ]
    },
    description: {
        type: String,
        maxLength: [ 256, '##Description: maximum length 256 Characters' ],
        default: ""
    },    
    portions: {
        type: Number,
        default: 1
    },    
    instruction: {
        type: String,
        maxLength: [ 1024 * 16, '##Instruction: maximum length 16k' ],
        default: ""
    },    
    picTime: {
        type: String,
        default: "" 
    },
    picture: {
		contentType: String,
		data: Buffer
	},
    time: {
        prepare: { type: Number, default: 0 },
        cook: { type: Number, default: 0 }
    },
    keywords: {
        type: String,
        default: ""
    },
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
    ingredients: [ { 
                    _id: false, 
                    ingRef: { type: mongoose.Schema.Types.ObjectId, ref: "ingredient" }, 
                    quantity: { type: Number, default: 0.0 }, 
                    unit: { type: String, default: "" },
                    note: { type: String, default: "" },
                   }
                 ]

}, { versionKey: false });

const Recipe = mongoose.model("recipe", RecipeSchema);
/********************************************************************************* 
 * Comments
 */
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
 * Ratings
 */
 const RatingSchema = mongoose.Schema({

    recipeid: { 
        //type: mongoose.Schema.Types.ObjectId, ref: "recipe", 
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
}, { versionKey: false }).index( { "recipeid": 1, "userid": 1 }, { unique: true } );


const Rating = mongoose.model("rating", RatingSchema);

//------------------------------------------------------------------------------------
// ================= CREATE TESTDATA =================================================
const db = database.init();

// ** Password

const pwEncrypt = async ( password ) => await bcrypt.hash( password, 5 );
//const pwCompare = async ( password, hash) => await bcrypt.compare(password, hash);


/********************************************************************************* 
 * create() - Build collections
 */
 async function create () {

    // ** get existing collections 
    const collections = await mongoose.connection.db.collections();

    // ** drop all
    for (let collection of collections){
        await db.dropCollection(collection.collectionName);
        console.log(`"${collection.collectionName}" dropped`)
    }

    // ** create new users-collection
    const userpic =  fs.readFileSync( './default/userDefault.png' );

    let password = "12345678";
    
    if(ENCRYPT)
        password = await pwEncrypt("12345678",5);

    console.log("encrypt=",ENCRYPT)
    console.log("Create users..");
    let users = [];
    const timestamp = '.' + Date.now();

    users.push( await (new User( { name: "Beate", description: "Ich koche alles kalt", email: "beate@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } ) ).save() );
    users.push( await (new User( { name: "Robert", description: "Rabaarber Rabaarber", email: "robert@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Heike", description: "Ich koche alles kalt", email: "heike@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Dieter", description: "Rabaarber", email: "dieter@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "August", description: "Chefkoch", email: "august@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } ) ).save() );
    users.push( await (new User( { name: "Maria", description: "Huhu", email: "maria@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Jörg", description: "", email: "joerg@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Halime", description: "", email: "halime@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Gina", description: "", email: "gina@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } ) ).save() );
    users.push( await (new User( { name: "Okan", description: "", email: "okan@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Andi", description: "", email: "andi@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    users.push( await (new User( { name: "Rebekka", description: "", email: "rebekka@mail.com", role: "user", password: password, verified: Date.now(),
                                picTime: timestamp, picture: { contentType: "image/png", data: userpic } } )).save() );
    // -----------------------------------------------------------------------------------------------------------------------
    // ** Comments
    const comments = ["Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate",
                      "Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat",
                      "Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in",
                      "Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in Buchstabhausen an der Küste des Semantik, eines großen Sprachozeans. Ein kleines Bächlein namens Duden fließt durch ihren Ort und versorgt sie mit den nötigen Regelialien. Es ist ein paradiesmatisches Land, in dem einem gebratene Satzteile in den",
                      "Eine wunderbare Heiterkeit hat meine ganze Seele eingenommen, gleich den süßen Frühlingsmorgen, die ich mit ganzem Herzen genieße. Ich bin allein und freue mich meines Lebens in dieser Gegend, die für solche Seelen geschaffen ist wie die meine. Ich bin so glücklich, mein Bester, so ganz in dem Gefühle von ruhigem Dasein versunken,",
                      "Jemand musste Josef K. verleumdet haben, denn ohne dass er etwas Böses getan hätte, wurde er eines Morgens verhaftet. »Wie ein Hund!« sagte er, es war, als sollte die Scham ihn überleben. Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheueren Ungeziefer verwandelt. Und es war ihnen wie eine Bestätigung ihrer neuen Träume und guten Absichten, als am Ziele ihrer Fahrt die Tochter als",
                      "Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind. Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen. Erstens: wir haben nicht offensiv gespielt. Es gibt keine deutsche Mannschaft spielt offensiv und die",
                      "Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte",
                      "Überall dieselbe alte Leier. Das Layout ist fertig, der Text lässt auf sich warten. Damit das Layout nun nicht nackt im Raume steht und sich klein und leer vorkommt, springe ich ein: der Blindtext. Genau zu diesem Zwecke erschaffen, immer im Schatten meines großen Bruders »Lorem Ipsum«, freue ich mich jedes Mal, wenn Sie ein paar Zeilen lesen. Denn esse est percipi - Sein ist wahrgenommen werden. Und weil Sie nun schon die Güte haben,",
                      "Zwei flinke Boxer jagen die quirlige Eva und ihren Mops durch Sylt. Franz jagt im komplett verwahrlosten Taxi quer durch Bayern. Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich. Vogel Quax zwickt Johnys Pferd Bim. Sylvia wagt quick den Jux bei Pforzheim. Polyfon"
                     ]
    
    // ===========================================================================================
    // Import JSON-File 
    // ===========================================================================================

    const jsonFilePath = "./rcpImport.json";
    
    if ( !fs.existsSync( jsonFilePath )) {
        console.log(`Datei "${jsonFilePath}" nicht gefunden..`)
        process.exit(0);
    }
    
    console.log("Create recipes & ingredients..");

    const jsn = JSON.parse( fs.readFileSync( jsonFilePath, {encoding:'utf8'} ));
    const recipepic =  fs.readFileSync( './default/recipeDefault.png' );

    for( let rcpNo=0; rcpNo < jsn.length; rcpNo++ ){

        let recipe = new Recipe({ 
                                  name: jsn[rcpNo].name,
                                  author: users[ Math.floor( Math.random() * users.length ) ],  
                                  description: jsn[rcpNo].description,
                                  time: jsn[rcpNo].time,
                                  portions: jsn[rcpNo].portions,
                                  ingredients: [],
                                  instruction: jsn[rcpNo].instruction,
                                  ratings: { users: 0,  //Math.round(Math.random() * 20 ), 
                                             avgRate: 0, //Math.round( Math.random() * 500  ) /100 
                                           },
                                  picTime: timestamp,
                                  picture: { contentType: "", data: null }
        });
        // ** Create ingrediens and put their id's into linked recipes 
        for( let ingredNo=0; ingredNo < jsn[rcpNo].ingredients.length; ingredNo++){

            let ingred = await Ingredient.findOne({name: jsn[rcpNo].ingredients[ingredNo].name});

            // ** Create new ingedient if not exist
            if(!ingred){   
                ingred = new Ingredient({
                                  
                                name: jsn[rcpNo].ingredients[ingredNo].name,
                                unit: jsn[rcpNo].ingredients[ingredNo].unit,
                                category: ""
                });
                ingred = await ingred.save(); 
            }

            // *** set ingredients quantity allways to 1 portion
            if( recipe.portions > 1){
            
                let quantity = Number(jsn[rcpNo].ingredients[ingredNo].quantity);  
                
                // console.log(`${recipe.name} -> ${jsn[rcpNo].ingredients[ingredNo].name} = "${quantity / recipe.portions} ${jsn[rcpNo].ingredients[ingredNo].unit}" (Menge für 1 von ${recipe.portions} Portionen)`);
                if( quantity !== NaN && quantity > 0 )
                    jsn[rcpNo].ingredients[ingredNo].quantity = (quantity / recipe.portions)
            }
            recipe.ingredients.push({ 
                                      ingRef: ingred._id,
                                      quantity: jsn[rcpNo].ingredients[ingredNo].quantity,
                                      unit: jsn[rcpNo].ingredients[ingredNo].unit,
                                      note: jsn[rcpNo].ingredients[ingredNo].note  
            })
        }    

        const picfile = './pictures/' + jsn[rcpNo].picture.substr(jsn[rcpNo].picture.lastIndexOf('/')+1);

        if( fs.existsSync( picfile ) ){
            recipe.picture = { contentType: "image/jpeg", data: fs.readFileSync( picfile ) };
            console.log(`Recipe Picture "${picfile}" imported`);
        }    
        else{        
            recipe.picture = { contentType: "image/png", data: recipepic };        
            console.log(`Recipe Picture "${picfile}" not found`);
        }    
        // ** Comments --------------------------------------------------------
        console.log("Create comments")
        
        //let n1 = Math.floor( Math.random() * 999 ) + 50;
        let n1 = Math.floor( Math.random() * 67 ) +1;
        for( let i2 = n1; i2 >= 0; i2-- ){

            await Comment.create( {

                    recipe: recipe._id,
                    author: users[ Math.floor( Math.random() * users.length ) ],
                    written : Date.now(),
                    text: comments[ Math.floor( Math.random() * comments.length ) ],
            });
        }
        recipe.comments = n1 +1;
        recipe = await recipe.save();

        // ** Ratings --------------------------------------------------------
        console.log("Create ratings")
        Rating.createIndexes({ "recipeid": 1, "userid": 1 })


    }    
    console.log(`File "${jsonFilePath}" imported`);

    db.close();
    process.exit(0);
}
create();
