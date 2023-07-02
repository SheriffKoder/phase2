
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//using ejs

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

const mongoConnect = require("./util/database");

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");




const adminJsRoutes = require("./routes/admin.js");
//const shopJsRoutes = require("./routes/shop.js");

//app.use(adminJsRoutes.routes); //replaced code
//app.use(adminJsRoutes); //replaced code
//app.use(shopJsRoutes); //replaced code

////filtering mechanism
//not put /admin/.. in the routes links but put in the navigation/form etc.
app.use("/admin", adminJsRoutes);




//used the __dirname directly here because we are in a root file
/*
app.use((req, res, next) => {
    //res.status(404).send("<h1>Page not found</h1>");
    //res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    res.status(404).render("404", {myTitle: "404 Page", path: "404"});
});
*/
const errorController = require("./controllers/errorController.js");
app.use(errorController.get404);


//connect to the node server once connected to the database
//(1)
mongoConnect((client) => {
    console.log(client);
    app.listen(3000);
});




///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/*

NoSQL Databases/MongoDB

another alternative to SQL database that is used heavily

mongoDB driver to interact with mongoDB from inside our nodejs application

MDB is a database solution/engine
tool to run very efficient noSQL databases

can store and work lots and lots of data
large scale applications
quickly store and work with data

run a mdb server and then can have multiple "databases"
shop db, has multiple "collections" like users and orders

from inside each collection, we do not have "records"
but we have "documents" like users > {name:"max", age: "29"}

>> documents are schemaless
we can have any type of data inside the same collection



Database (shop)
Collections for shop (users, orders)
Documents for users {name:"max", age: "29"}



a document in mdb looks like this
in json data format (BSON: Binary JSON)
where it is transformed behind the scenes before storing it in the files
a json object is similar to a js object
where we can have embedded/nested documents 
like in address with objects/arrays/strings/numbers
{
    "name": "max",
    "age": "29",
    "address": { "city": "munich" },
    "hobbies": [ {"name": "cooking"}, {"name": "sports"}]
}


we can have a users collection
that "part" of its data is embedded in another orders collection

can depict the relation by embedding data in to other documents

when you copy the needed part of data from a collection to another collection
it stays there, so whenever looking into the another collection
we will not have to look into other collections for data - it is there
and that what makes it fast and efficient

mdb is built to make sure you build/store data in the format you need
without having to combine multiple collections behind the scenes

however can also set up relations
so we have two ways of relations
>> nested/embedded documents && references

references can be used when there is data updated constantly
and need to be updated in many places manually
lots of data duplications


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//installing

enter mongoDB atlas website
register
create new database with the free M0 option
make sure the users have read-write access

atlas admin role, is something the db admin does
we will not do db administration through node js

check the ip whitelist
for all ip addresses allowed to connect to mongodb server
add your ip address, as we are using a local server
later when deploying using a server, will put the ip address of that server


after database configured on the site
connect
connection method application
will give a url (a)
mongodb+srv://sheriffkoder:<password>@cluster0.jgxkgch.mongodb.net/?retryWrites=true&w=majority

# npm install --save mongodb



(1)///////////////////////////////////////////////////////////////////
//using

code the database.js file
so it can connect
and export that connection
to use in app.js

and use that imported as a function to server.listen

comment out the routes for now to avoid old code errors



(2)///////////////////////////////////////////////////////////////////
//connecting

go to product.js model and create a class constructor and import the mongoConnect database file

however
//the mongo connect would run a connection for every request
//if we could manage one connection in our database
//and then simply return access to the client that we setup once
//from the one or two different places that need access
// to do that we need to tune the mongoConnect

































*/


