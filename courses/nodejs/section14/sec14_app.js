///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//using ejs

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

const mongoose = require("mongoose");   //(2)
const User = require("./models/user"); //(8)


app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

const adminJsRoutes = require("./routes/admin.js");
const shopJsRoutes = require("./routes/shop.js");
const authRoutes = require("./routes/auth.js");


app.use((req, res, next) => {
    User.findById("64a6f2a6c017acc261356a8c")
        .then(user => {
            //req.user = user;
            //create a new user in order to be able to call its methods 
            //mongoDB //(10)
            //req.user = new User(user.name, user.email, user.cart, user._id);

            //mongoose //(8)
            //user here is a full mongoose model, can call methods on the req.user object
            req.user = user;

            next();

        })
        .catch(err => {
            console.log(err);
        })

});







//app.use(adminJsRoutes.routes); //replaced code
//app.use(adminJsRoutes); //replaced code
app.use(shopJsRoutes);

////filtering mechanism
//not put /admin/.. in the routes links but put in the navigation/form etc.
app.use("/admin", adminJsRoutes);
app.use(authRoutes);




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
/*
mongoConnect(() => {

    app.listen(3000);
});
*/

//(2)
//enter the mongoDB connect url
//make sure to enter mongodb.net/shop for the shop database
mongoose.connect("mongodb+srv://sheriffkoder:Blackvulture_92@cluster0.jgxkgch.mongodb.net/shop?retryWrites=true&w=majority")
    .then(result => {

        //always gives back the first user it finds
        //(8)
        User.findOne().then((user) => {
            //if user is undefined/not set - create a new user
            if (!user) {
                //(8)
                const user = new User({  
                    name: "max",
                    email: "max@test.com",
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })  
    .catch(err => {
        console.log("mongoose connect" + err)
    });



///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////



/*
///////////////////////////////////////////////////////////////////
//(1)

as we had sequelize for SQL, we have Mongoose for MongoDB
which enables you to focus more on the code and data
instead of working with the queries

sequelize was O R M
Object Relational Mapping Library

Mongoose is an O D M
Object Document Mapping Library

MongoDB is not a relational db, it thinks in Documents


the user data (js object)
map it/save it into a collection

so in mongoDB we used
db.collection("users").insertOne({name: "max", age: 28, password: 23123})

in mongoose
const user = User.create({name: "max", age: 28, password: "23123"})

see how object or our data should look like and then work with it

mongoose allows us to define models by which we can work
and then all the queries are done behind the scenes
and still we can influence/change some things


//Core Concepts:
we can work with Schemas & models > define how our models should look like 
e.g "User",Product

Instances > to create js objects that are based on our blueprints
const user = new "User"()

then we can run queries
"User".find()


//on mongoose website can see the official docs 
for more information and usages
as this course aims to focus on nodejs and give an introduction to mongoose
core fundamentals
 


///////////////////////////////////////////////////////////////////
//(2) installing and connecting to mongoDB

#npm install --save mongoose

connecting:
we do not need a database.js file as mongoose does all the configurations behind the scenes

>> import mongoose in the app.js file
and use its connect method to listen to the server

will transfer the code to mongoose
. comment out the routes and will gradually comment them back in
. comment out the models and remove lines which use the database file
. remove all data from mongoDB compass app
. comment out the user in app.js

will use the same mongodb server but with using the mongoose package

>>define a product schema for mongoose in the product model


///////////////////////////////////////////////////////////////////
//(3)
//-> a model based on the Schema and then create an object based on the model and work with that

define the mongoose model for the product schema

>>postAddProduct
define a new product instance
the save method is defined by mongoose
comment in the routes
[now we can fill in a product and click add[post] to add it to the database]

new product({values})
product.save


//214
///////////////////////////////////////////////////////////////////
//(4) fetching all products

using productmodel.find()

///////////////////////////////////////////////////////////////////
//(5) single product details

getProduct in shop.js controller
mongoose has a findById method with id transformation to mongo object


///////////////////////////////////////////////////////////////////
//(6) Updating products

//let us complete the curd functionalities on the admin side
and be able to add and delete products

getEditProduct
getProducts

postEditProduct
just call the findById ad and then call the save method in it, the object will be updated


>> mongoose logic is very similar to sequelize


///////////////////////////////////////////////////////////////////
//(7) Deleting products

//last part of the curd operations

>> PostDeleteProduct in admin js controller
ProductClassModel.findByIdAndRemove(prodId)



///////////////////////////////////////////////////////////////////
//(8) Adding and using a user model and saving to the database

//add a user and see how can relate different entities with mongoose
//so can manage relations
//then can work with the cart and orders

>> create a user schema as done with the product
the user also had a cart, with items and define the type of the 


>> create and save a user in app.js before listening to server
it will appear in the database

>>comment in the user middleware in app.js
and copy the database's user id to the findById in the middleware


///////////////////////////////////////////////////////////////////
//(9) using relations in mongoose

using the user with the product model
every product should be assigned to a user
need to change the product schema

a product should have a userId field referring to the user model
and the user cart's item id should refer to the product model

when creating a new product in "postAddProduct" it should also have a userId
>> userId: req.user._id //however can just use req.user and mongoose will pick the id from that object

now a created product will have a userId


//220
///////////////////////////////////////////////////////////////////
//(10) fetching relations

want to get all the user data for the related user and not just the id

using find().populate(userId)
will replace userId with "all" the user's data (object)

ProductClassModel.find()
.select("title")    //this will output the "product" with title only no price etc
.populate("userId", "name") //this will output the "userid" with id,name only no email etc


///////////////////////////////////////////////////////////////////
//(11) working on the shopping cart

//using the addToCart method defined in mongoDB example
can add methods to the mongoose model by
the .methods method

postCart in shop controller should be the same


when adding a product the object of the product id and quantity will have an automatically generated id
mongoose adds id's for sub documents

//check the official docs for more info about schema methods

///////////////////////////////////////////////////////////////////
//(12)

basically in mongoDB
getCart did
-output the cart items id's
return 
in products, find all products by ids of cart's ids
return an array of the with their quantity from the cart

now we need to populate the product id with all the data we are interested in

populate does not return a promise
so have to chain with execPopulate() so can chain .then

adjust the ejs based on the middleware product output


///////////////////////////////////////////////////////////////////
//(13) Deleting cart items

postCartDeleteProduct in the shop controller

>> add remove from cart method inspired from the mongoDB's method


///////////////////////////////////////////////////////////////////
//(14) creating and getting orders

in mongoDB we did in the user model a method that
took cart's products,
created an order object 
with the items and data about the user
then inserted this into a order collection
then we cleared the cart

>> create order.js in models folder

define an order model
import into the shop controller

in the shop controller
take from the user cart items with the product data and quantity
create a new order with schema like the model
order.save


///////////////////////////////////////////////////////////////////
//(15)
//working on clearing the cart after making an order
user method to clear cart which adds an empty array to cart items
in the controller        req.user.clearCart();


///////////////////////////////////////////////////////////////////
//(16) getting and displaying the orders

shop controllers getOrders
uses getOrders in the user model
im mongoDB
it goes to the orders collection and find all orders for that user




///////////////////////////////////////////////////////////////////
//Wrap up

dive into the official docs on the website
try playing around with the application
try adding sub totals to the orders

*/

/*
//231-237
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Section14

storing data in memory or even on the client side (in the browser)

Sessions and cookies
how to use both and use together

when the user reloads the page
therefore technically a new request is sent
we still have that information regarding his request around
that the user is logged in

cookies are stored on the client side


///////////////////////////////////////////////////////////////////
//(1) creating a login page and connecting to the project

added a login button in the header ejs with link to "/login"

create an auth.js controller to render auth/login.ejs
create a "auth.js" in the routes folder
add to app.js the route by importing and using

adjust the header ejs link to make the login active on visit

add a auth/login.ejs view
like previous ejs files with a form of email/password
with importing and creating an auth.css public file



///////////////////////////////////////////////////////////////////
//(2) use a cookie to save the information that this user is logged in

add in auth controller
a postLogin to redirect to "/" when user click login button

in the head ejs, two links will be displayed
when isAuthenticated is passed/true

add to all renders to all controllers 
isAuthenticated: req.isLoggedIn

so the isAuthenticated in the auth controller can be set on

however after redirecting in the auth controller
the request is done and the value set for isAuthenticated is removed

we do not want to share the same authentication
between different users or same ip


///////////////////////////////////////////////////////////////////
//(3)

using a global variable in an external file can help 
but it is accessible for different users

this is where cookies can help
we can store data in the browser of a single user
customized to that user
which does not affect all the other users
but can be sent with requests to tell "i am already authenticated"

>>setting a cookie
by setting a header
res.setHeader("Set-Cookie", "loggedIn=True");

you will see in the dev tools > application > cookies
the value for loggedIn

expire session : expire when the browser is closed


//
once the cookie is set, the browser by default sends it to the server
with every request we make

go to the products page
then open in dev tools > network > (products) > headers > cookie
this means it was sent to our server 
and every request will have this cookie attached to itself

with using
console.log(req.get("Cookie"));
console.log(req.get("User-Agent"));
you can view the "cookie" values for the "products" request


//
we did set a cookie in the post request
and we retrieved the cookie in the get request
and stored it in the isLoggedIn
which is passed through the render isAuthenticated: isLoggedIn

const isLoggedIn = req.get("Cookie").trim().split("=")[1];


thus: a cookie is always sent on every get request to getLogin
cross request data storage

also there are third party packages that can help with extracting cookies


///////////////////////////////////////////////////////////////////
//(4) More about cookies

there is a disadvantage
as we can change the value through dev > application > cookies
using the previous Set-Cookie

thus sensitive data should not be stored in the browser
sessions are a better alternative for sensitive data
or loggedIn data
otherwise can be manipulated
using the dev tools or browser injected js code

cookies for tracking users, advertising 
is a popular instrument

tracking:
cookies do not have to relate to your page
and can be sent to another page
like tracking pixel on pages
which is an image url with no real image
but that image can be located on google's servers
and you have a cookie on that page that can be sent along with that
and with that, google can track on which page you are
and how you are moving through the web
even if you are not on their websites
because some data is stored in your client (can be deleted)
and can be sent with every request to google
so they can track you without you being on their servers
so storing that information on their servers will not work
but storing on your computer will work
because obviously that can be sent with every page you visit

//can add certain values to the cookie header
expire using some http date format, if not set cookie will be session
or . Max-Age=seconds to expire after some time

("Set-Cookie", "loggedIn=True; Expires=''; Max-Age=10 ");

max-age; can be used for how long an authenticated session
should stay for a user or timeout after a certain duration

. Domain: "where this cookie should be sent"
. Secure (without values) cookie will be sent if page served via https only
. HttpOnly (without values) sent to the server but cant read from inside the browser js code
    cant access the cookie value through client side javascript
    scripts attached in the browser, protects against cross-site scripting attacks
    client side js where someone could inject js malicious code cant read your cookie values
    (will be important when storing important parts of authenticating the user)
    however in the dev tools you can still read it

//we will use https later in the course

 

often you will not directly set your cookies
can use some packages for: authentication
that will manage setting the cookies for you















*/