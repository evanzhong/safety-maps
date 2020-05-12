const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://daviddeng8:SafetyMaps@crimedata-pebxn.mongodb.net/test?retryWrites=true&w=majority"
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        await listDatabases(client);
        
        /*let personDocument = {
            "name": { "first": "Alan", "last": "Turing" },
            "birth": new Date(1912, 5, 23), // June 23, 1912                                                                                                                                 
            "death": new Date(1954, 5, 7),  // June 7, 1954                                                                                                                                  
            "contribs": [ "Turing machine", "Turing test", "Turingery" ],
            "views": 1250000
        }

        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(personDocument);
        // Find one document
        const myDoc = await col.findOne();
        // Print to the console
        console.log(myDoc);*/
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

//run().catch(console.dir);

module.exports = run();