/*

//templating engines
//able to understand a certain syntax present in html code
// and replace 

//free temp engines
. ejs; normal html       <p> <#= name %> </p>
. pug (jade);  p #{name}
    does not use real html, replaces with a minimized version
    custom temp language
.handlebars; <p> {{name}} </p>
    normal html, custom temp language, limited set of features



(1*) # npm init   - to initialize the project directory for npm usage
(2) edit the scripts object in the package.json provided, "start": "node fileName.js", "start-myServer": "nodemon createUser.js"
(3) # npm start / npm run customStart
(4) # npm install nodemon --save-dev    (development dependency: not needed on real server)
(-) # npm install nodemon -g    (global dependency: available on every server launched and be able to use it in the terminal)
(-) # npm install   (installs the packages in the .json dependency)

(5*) # npm install --save express    (production dependency: be present with every application shipped)
(6*) # npm install --save body-parser

[2] # npm start // # npm run nodemon-start
(7*) npm install --save ejs pug express-handlebars@3.0


//express-handlebars has integration with express rather than handlebars alone
//ejs and pug have built in integration



*/

//(1) default requires
const http = require("http");
const express = require("express");
const app = express();
const path = require("path");




/////////////////////////////////////////////////////////////////

//(2) set temp engine
////for HandleBars (hbs) as it is not built in
//const expressHbs = require("express-handlebars");
//the object in expressHbs is for the layouts directory used for all files
//can change default layout to have an extension if using a custom extension
//app.engine("handlebars", expressHbs({layoutsDir: "myViewsFolder/layouts", defaultLayout: "main-hbs-layout"}));

//tell express what templating engine we are using and where our public files folder is
app.set("view engine", "ejs"); //pug, handlebars
//tell express what folder is the views(html) folder in our root directory
app.set("views", "myViewsFolder");




//(3) set static
//set static file locations, allows to use .css/.js files in the public folder
app.use(express.static(path.join(__dirname, "myPublicFolder")));




/////////////////////////////////////////////////////////////////
//(4) import/use routes and body-parser
//import route code files as normal and use the body-parser
const adminJsRoutes = require("./myRoutesFolder/admin.js");
const shopJsRoutes = require("./myRoutesFolder/shop.js");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

//use the imported route files and a default use for 404
app.use(adminJsRoutes.routes);
app.use(shopJsRoutes);




//(5) default 404 use
app.use((req,res,next) => {
    //res.status(404).send("<h1>Page not found</h1>");
    //res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    res.status(404).render("404", {myTitle: "404 Page"});




});


//(6) listen
app.listen(3000);



// .render("...") by nodejs makes user of the defined temp engine and then return that template
// as we stated all the views are in the views folder, no need to construct a path, can just say shop

//the way you pass template values in res.render
//are the same across all templating engine
//the difference is how you use it from engine to engine


//res.writeFile (node), res.send (express), res.render (temp)


//(1) app.js:   write this code - where myTitle is a variable shared with html-templates
//(2) utl:      copy the utl folder (for root directory code)
//(3) routes:   code admin.js/shop.js to render.pug on get and push data on post
//(4) .pugs:    no need for .html files, we will render htmlish template engine files (.pug) in views folder
//(5) layout.pug: views/layouts/main-layout.pug







////temp-engines allow to
// output html
// output values using insertion syntax
// repeat a part of the html for each url visit/post 
        //pug: each product in prods
        //hbs   //{{#each array}}   //array here is prods in our case
                //{{this.adminjsfilekey}}
                //{{/each}}

        //ejs
        // <%  for (let products of prods) {%>
        //     normal html
        // <% } %>
        


// if statement //pug: if prods.length > 0
                //hbs   //{{#if hasProducts}}
                        //{{/if}}   //close the if condition
                        //{{#else}}

                //ejs
                // <% if (prods.length > 0) { %>
                //     normal html
                // <% } else { %>
                //     <h1> no products found </h1>
                // <% } %>
  

//in the html form name=productAdded
//pug uses indenting to order its html nesting output, indenting sensitive


////layouts:
//handlebars does not have insertion block like pug
//we can use     {{{ body }}} and keep only the main html in the .handlebars
//to add insertions like add extra link in html head
//use if statements for object keys exported from the render
//{{#if productCSS}}
    //link
//{{/if}}


//ejs// does not have layouts
//can use <%- include("includes/head.ejs") %> to include html'sh parts in the .ejs files
//a feature pug/handlebars also know
//create a folder "includes" in the views folder
//that will contain the header, etc.
//syntax:
    //<%=value %> //html will be displayed as text
    //<% vanilla js code %>




//notes:
//in routes js files 
    //we render fileName and the temp engine file extension will be added depending on the defined template in app.js
    //also we add/pass an object to the render, of keys values, will be used in the htmlish syntax
        //like myTitle, path, 

        //pug
        //and enable the add-product link only when path is add-product
        //a(href="/add-product" class=(path === "/add-product" ? "active" : "" ) ) Add Product
        //path is put without #{} because it would not be considered a text

        //hbs
        //we used activeShop, productCSS true values in order to be used 
        //in the html'sh if's as we cannot insert

        //ejs
        //<a class="<%= path === '/add-product' ? 'active' :'' %>" > </a>



//followed by assignment4 in section4