import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

//  ------------> LOKALE DATENBANK (Docker) <--------------------------------------
if( !fs.existsSync('./database/.remote') ){

    dotenv.config({ path: "./database/database.env" });
    const URI = `${process.env.d_MONGO}${process.env.d_USER}:${process.env.d_PASS}@` +
                `${process.env.d_HOST}:${process.env.d_PORT}/`;
    try{
        mongoose.set('strictQuery', true);
        await mongoose.connect( URI,
            {
                dbName: `${process.env.d_DATABASE}`, //<-- DATENBANK IST JETZT HIER!
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoCreate: false,
            }
        );
        //console.log("\n  ", URI);
        console.log(`\n   "${process.env.d_DATABASE}" local connected`,'\n');
    }
    catch(err){
        //console.error("\n  ", URI); 
        console.error(`\n   "${process.env.d_DATABASE}" local connection error:`, err.message,'\n');
        process.exit(1);
    }
}   //  ------------> REMOTE DATENBANK (Atlas) <-----------------------------------
else {
    dotenv.config({ path: "./database/atlas.env" });
    const URI = `${process.env.d_MONGO}${process.env.d_USER}:${process.env.d_PASS}@` +
                `${process.env.d_HOST}/${process.env.d_DATABASE}` + `${process.env.d_URLOPTIONS}`;

    try{
        mongoose.set('strictQuery',true);
        await mongoose.connect( URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoCreate: false,
            }
        );
        //console.log("\n  ", URI);
        console.log(`\n   "${process.env.d_DATABASE}" remote connected`,'\n');
    }
    catch(err){
        //console.error("\n  ", URI);
        console.error(`\n   "${process.env.d_DATABASE}" remote connection error:`, err.message,'\n');
        process.exit(1);
    }
}    

const init = function () {
	const db = mongoose.connection;
    db.on('disconnected', () => { 
        console.error(`ERROR: "${process.env.d_DATABASE}" disconnected - connection lost!`); 
    });
    return db;
}

export default { init } ;
