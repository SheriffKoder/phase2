/*

scripts on the node.js project that helps us 
in running the file

npm
node package manager, installed by default by node js
also to install third-party packages
and initialize the node project and add extra features

third-party packages,
codes that are not included into nodejs
so not reinvent the wheel
could help with parsing incoming requests, validating user input
packages like: express, body-parser
packages are stored in the npm repository
a cloud repo
installed and manage with the npm tool



//////Start npm script
project directory
# npm init

will ask for package name etc.
and out put a json file with configuration information

can add a start script in the json file
so when # npm start this terminal script always run

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node createUser.js",
    "start-myServer": "node createUser.js"

  },


where start is a reserved name
    # npm start
start-myServer is a custom name
    # npm run start-myServer

helpful so when the code is shared
people do not have to figure out which file is the entry file
and just run npm start in terminal


//////auto-save server code and restart


# npm install package-name 

check the package description on the npm library

development dependency because only used during the development process
so once the app is installed on a real server, we do not need it there
as we will not change its code dynamically

//install as a production dependency 
# npm install package-name --save 

//install as a development dependency
# npm install package-name --save-dev

//install globally so can be used anywhere not just in the project
# npm install package-name -g


## npm install nodemon --save-dev

install the package in the node_modules directory
with its dependencies
this will update package.json
and add package-lock.json, and node_modules directory

## npm install
will look for the dependencies in package.json 
and install any updates available

can delete the node_modules directory
and when start working on the nodejs project again 
run npm install to install the packages

codes are shared with the source-codes without the modules folder
and when want to use them run # npm install



once the a package is installed can be used in code
# npm install --save express-session
//const sessions = require ("express-session");



//use nodemon auto-save
change start script to nodemon yourFilename.js
however changes are reset


nodemon app.js would not work in the terminal 
or command line because we don't use local dependencies 
there but global packages.
can install nodemon globally if want this feature


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Errors

syntax errors; typos
runtime errors: code break when it runs
logical errors: app does not work the way it show, not show an error


nodejs debugger helps with logical errors
debugger attached and listening

highlight the line of code to stop at (+1 below) breakpoint
Run > Start debugging
select your start script and >
now can hover over the variable and see its contents
and use the middle menu to step into how the code runs

and more information in the left side debugger menu view
. where you can add watchers to watch them while going through code 
outside of the variables drop down menu
. breakpoints to check/uncheck
. callstack how the process went for your code and nodejs code

can use the variables in the table in the
debug console
not affect the code running, to experiment

can change the variables in the table
and it will affect runtime



//to restart
Run > add configuration >
add this line below "programs"
            "restart": true,
            "runtimeExecutable": nodemon,
            "console": "integratedTerminal"
select the program to be "app.js" file
to not use the routes.js file
as as start for debugging

but nodemon has to be installed globally



npm; node package manager
can initialize a project with npm init
make npm scripts
use 3rd party packages


///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Express.js

so you can focus on application logic not standard tasks
like extracting incoming data, routing..


can install as a third party package into your project

What is Express.js ?
Using Middleware
Working with Requests & Responses (Elegantly!)
Routing
Returning HTML Pages (files) instead of code


//What is Express.js
help install a package that does the parse data part

use a framework for the heavy lifting
framework: helper functions, tools and rules
that help you build your application


//alternatives to Express.js
vanilla node.js
Adonis.js (larvel inspired)
Koa
Sails.js


//install as a production dependency
because it should be present with every application shipped
# npm install --save express


create an express application
and store it in a constant

CMD + hover over express module will show the source code

express exports a function 
express, store and manage a lot of things behind the scenes


express.js is all about middleware
incoming request is automatically funneled by functions by expressjs
until a response is sent

request > middleware next() > middleware res.send() > Response

this allows splitting into many functions/pieces instead of a huge function
and plug in third party to add functionalities


nodemon on s4_app ?
*/



/*
const http = require("http");
const express = require("express");

//call the express return
const app = express();

//call a method defined by express
//allows to add a new middle ware functions
//accepts an array of request handlers
//pass a function to use, that will be exe on every incoming request
//which will receive three arguments
// req/res/next
//next is a function will be passed by express
//has to be exe to allow the request to be passed on to the next middleware
//adding next(); allow the request to be passed to the next middleware inline

app.use((req, res, next) => {
    console.log("in the middleware");
    next();
});

app.use((req, res, next) => {
    console.log("in the next middleware");

    //can still send responses as before with res.write 
    
    //send of express allows to send a response with data type any
    //sending an html string has automatically the content-type set to html
    //can overwrite this functionality
    //by res.setHeader to change content type like before
    //can check the source code for response.js > send
    //to know what it does and how it switches to html type on string
    //by default a string is considered an html
    res.send("<h1> Hello from Express</h1>");
    console.log(req.url);
    
});

//const server = http.createServer(app);
//server.listen(3000);
//which is
//(require("http").createServer(this)).listen(3000);
//can be replaced with
app.listen(3000);
*/

//want to handle different urls
//app.use(path,callback);
//path string/pattern/reg-ex pattern to match paths or array of these
//callback; middleware function, series of functions separated by commas, array of functions, combination of all of these

//path of "/" means any url does start with "/" not just "/"
//to separate, put the code for the url containing the next url before without next();
//avoiding next(); here is like avoiding sending another response in vanilla node
//next() allows the request to continue

/*

const http = require("http");
const express = require("express");
const app = express();

let productAdd = `
<form action="/product" method="POST">
    <label for="html"> Add Product </label>
    <input id="html" type="text" name="productAdded">
    <button type="submit"> Add Product </button>
</form>
`;

/*
//this code will run twice
//1st on its call on /, 2nd on visiting any page starting with "/"
//as the request is allowed to continue
app.use("/", (req, res, next) => {
    console.log("this always runs");
    next();
});
*/

//parser
//by default request does not parse the incoming
//request body
//to do that is to register a parser
//before other route handling middlewares
//because the parsing of the body
//should be done no matter where the request ends up
//by installing # npm install --save body-parser
//urlencoded registers a middleware and call next() at its end
//able to parse bodies like ones sent through a form, not files
//files will use a different parser

//configure in urlencoded the config option {extended:false}
//to be able to parse non default features

//now we are able to have an object of the input
//easier to extract than before with the split


/*

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use("/user", (req, res, next) => {
    //console.log("in the user middleware");
    res.send("<h1> Hello user Express</h1>");
});

//add form input page
app.use("/add-product", (req, res, next) => {
    //console.log("<h1>Add product page");
    res.send(productAdd);
});

//output the added input
app.post("/product", (req, res, next) => {
    //console.log(req.body);    
    //outputs object, so can know the keys, related to bodyParser
    console.log(req.body["productAdded"]);
    //res.send("<h1>Add product page 2");
    res.redirect("/");
});

app.use("/", (req, res, next) => {
    //console.log("in the / middleware");
    res.send("<h1> Hello / Express</h1>");
});

app.listen(3000);


//the request travels from top to bottom
//but only goes from middleware to middleware
//if you call next in the previous middleware "use" parameter





//till here same code copied edited in the routes folder files
//and started to work on html files from the views folder
*/
///////////////////////////////////////////////////////////
//routing

//want to only listen to a "post" request for the app.use having req.body
// "app.use" works for all http methods
//use "app.get" only will fire for incoming get requests
// use "app.post" to filter for post requests

//so the app.post above will run on the form post request
//but not when url manually entered for /product

//also have app.delete/patch/put



//create a routes folder
//create admin.js that handles the creation of products
//which an admin of the shop can do
//create shop.js (what the user will see)

//put the product add code to admin.js

//express.router explained in admin.js/
//code copied from above example to the ./route files
//removed app.use and replaced with get and post






const http = require("http");
const express = require("express");
const app = express();
const path = require("path");

//import the admin.js file module
//order of import does not matter
const adminJsRoutes = require("./routes/admin.js");
const shopJsRoutes = require("./routes/shop.js");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));


//calling the exported router object in app.use (just by itself)
//so its code can run at this place/order (order matters)


app.use(adminJsRoutes); //replaced code
app.use(shopJsRoutes); //replaced code

////filtering mechanism
//useful to not repeat paths
//app.use("/admin", adminJsRoutes);
//only routes starting with /admin (ex. /admin/add-page)
//will be executed from this code 
//do not add the /admin in the route files's paths
// "./admin" will be placed before any path
//so place /product .. and enter /admin/product url for this to work
//but the form should have a path with "/admin/add-product"

//if we reach here, and no middleware executed
//we will get and error as we did not handle that request
//set a 404 error page

//catch all middleware
//handles all http methods (.use)
//chaining the status() method before .send()
//always before send() can call status(), setHeader() etc.
//404 a common path for a page not found
app.use((req, res, next) => {
    //res.status(404).send("<h1>Page not found</h1>");
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));

});



app.listen(3000);

//we can repeat the paths without conflict if used
//different methods like get/post



///////////////////////////////////////////////////////////
////serving html pages


//we will slowly work towards mvc
//model view controller

//create a views directory to place
//what we serve to the user in our application
//which will be a bunch of html files

//create a shop.html in the views folder
//this will be for users visiting "/"

//create also add-product.html

//will use these files later, 
//with the concept of templating engines
//to be able to dynamically add content to the html files

//create in the html files
//html nav bar links
//main content of a form posting to /add-product (add-product.html)
//main content of products (shop.html)

//we will learn later how to manage data on the server


//now want to serve these html files in our routes

//// explanation continued from here in the shop.js
//where we added the path module also in admin.js
//path module is a built in



//const path = require("path");
//res.sendFile(path.join(__dirname, "..", "views", "shop.html"));


//we can get the parent directory with the help of a function
//we created in util/path.js


//not built in modules
//body parser
//nodemon
//



////serving html pages
