///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//using ejs

//# nom install --save express-session  //s14: use sessions
//# npm install --save connect-mongodb-session //s14: store session in MDB
//# npm install --save bcryptjs  //s15: password hashing
//# npm install --save csurf    //s15: protecting against CSRF
//# npm install --save connect-flash    //s15:3.9 wrong credentials 
//#npm install --save nodemailer nodemailer-sendgrid-transport //s16 3.11 sending emails
//sendGrid/Mailchimp etc need to be sorted out yet
//# npm install --save express-validator //s18 validating inputs //s18 18.0.1

const http = require("http");
const express = require("express");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

const mongoose = require("mongoose");   //(2)
const User = require("./models/user"); //(8)

const session = require("express-session"); //(2.6)
const csrf = require("csurf");  //(3.7)
const flash = require("connect-flash");   //(3.9)


const mongoDBStore = require("connect-mongodb-session")(session);
const MongoDbUri = "mongodb+srv://sheriffkoder:Blackvulture_92@cluster0.jgxkgch.mongodb.net/shop"; // mongoDB web app connect url //shop?retryWrites=true&w=majority
const store = new mongoDBStore({
    uri: MongoDbUri,
    //define a collection where your sessions will be stored
    collection: "sessions"
    //can also add when it should expire - and that can be cleaned automatically by mongoDB

});

//(3.7)
//executing the imported csrf as a function
//object to configure some things
//for example want to store the secret that is used for hashing your tokens
//the default settings should work fine, can dive into the official docs of the package to learn more
//const holds a middleware
const csrfProtection = csrf();

//(3.9)
//flash needs to be initialized, after the session
app.use(flash());


//(2.6)
//session core configurations
//pass a js object where we configure the session setup
//secret; for signing the hash secretly storing the id in the cookie
    //in production should be a long string value
//resave; the session will not be saved on every request that is done
    //on every response that is sent, only if something is changed in the session
    //will improve performance
//saveUninitialized; no session will be saved for a request
    //that does not need to be saved, bec nothing was changed about it
//can configure the session cookie for maxAge, expires
//can add cookie related configuration ,cookie {..}
//this middleware automatically sets/reads a cookie for the application
app.use(session(
    {
        secret: "my secret", 
        resave: false, 
        saveUninitialized: false,
        //(2.8)
        store: store

    }
));

//(3.7)
//csrfProtection is enabled but need to add something to our views to use it
//for any non get requests (post etc.)
//this package will look for the existence of a csrf token in your views/request body
//to make sure such a token is there, make sure we have it available in our views
//to do that we have to pass data into our view
//go to the controllers
app.use(csrfProtection);





app.use(express.static(path.join(__dirname, "public")));



app.set("view engine", "ejs");
app.set("views", "views");

const adminJsRoutes = require("./routes/admin.js");
const shopJsRoutes = require("./routes/shop.js");
const authRoutes = require("./routes/auth.js");


//(3.8)
//after the middleware that extracts our user
//but before our routes
////for every request that will be executed
//these two fields will be set for the views that are rendered
app.use((req, res, next) => {
    //a special feature/field provided by express js
    //locals allows to set local variables that are passed 
    //into the views which are rendered
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    //call next so we are able to continue
    next();
});

//this middleware execute first then next to the next app.uses
app.use((req, res, next) => {
    
    //this is the way of reaching the error handling middleware
    //as this part of code is (synchronous)
    //throw new Error("Dummy");

    //write a clever code what will succeed
    //by avoiding to find session.user if there is no session
    //to allow the middleware below to only run if there is a session.user
    if (!req.session.user) {
        return next();
    }

    //User.findById("64a6f2a6c017acc261356a8c")
    //User is a mongoose model with method findById
    User.findById(req.session.user._id) //(2.10)
        .then(user => {

            //this is to test the return next in the catch
            //throw new Error("Dummy");

            //clever code to avoid any possible errors
            //if cant find the user to continue 
            //and not store undefined in the user object
            if (!user) {
                return next();
            }

            //req.user = user;
            //create a new user in order to be able to call its methods 
            //mongoDB //(10)
            //req.user = new User(user.name, user.email, user.cart, user._id);

            //mongoose //(8)
            //user here is a full mongoose model, can call methods on the req.user object
            //req.user = user;

            //(2.10)
            //session/mongoose
            //use our session data to load a real user
            //mongoose user model
            //to allow all mongoose methods to work again
            //user that only lives for that request
            //retrieves data from the session
            req.user = user;

            next();

        })
        //this catch will not fire if not found the user with this id
        //it will fire if there is a technical issues, db down, 
        //user/app do not have sufficient permissions to use this action
        .catch(err => {
            //console.log(err);
            //(19.0.2)
            //console.log is not really useful
            //if we have a technical issue, we throw a real error
            //express js gives us a way of taking care of such errors
            //throwing an error has an advantage
            //we can also use next(); to continue
            //without request user being sent
            //if you throw errors in async (then/catch)
            //you will not reach the error handling middleware
            //to to make this throw work and go to the error middleware
            //throw an error before the .then (sync) part of code
            //throw new Error(err); < this does not work here
            //as this part is a async
            //use this
            return next(new Error(err).httpStatusCode=500); //(19.0.3)

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

//(19.0.2)
//render this in case of get, not when any route fails
app.get("/500", errorController.get500);

//catch all middleware
//not a technical error object
app.use(errorController.get404);

//(19.0.3)
//error handling middleware
//express is smart enough to detect that this is a special kind of middleware
//as it has an extra error argument
//and will move to it right away when we call next with an error object passed to it
//like in the addProduct controller
app.use((error, req, res, next) => {
    //res.redirect("/500");
     /*
    we can also not redirect
    and res.render() a page
    res.status(error.httpStatusCode).render(...)
    so we can use the httpStatusCode sent with 
    the error object in the controller middleware's returned
    or return some JSON data (will do later in the code)
     */
    res.status(500).render("500", {
        myTitle: "500 Page", 
        path: "/500",
                //isAuthenticated: req.isLoggedIn
        isAuthenticated: req.session.isLoggedIn //(2.9)

    });

})


//connect to the node server once connected to the database
/*
mongoConnect(() => {

    app.listen(3000);
});
*/

//(2)
//enter the mongoDB connect url
//make sure to enter mongodb.net/shop for the shop database
mongoose.connect(MongoDbUri)
    .then(result => {

        //always gives back the first user it finds
        //(8)
        /*
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
        */
        app.listen(3000);
    })  
    .catch(err => {
        console.log("mongoose connect" + err)
    });



///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
/*

Section 18

//290-300
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//(18.0.0)

Forms, User Input and Validation

Why Validating is important
How to Validate

the bigger your application is
the more data you would need from users at some time

User
v
<form> a request with the form data is sent
V
Validation
V
<Node Code>
V
Database / File


you can also configure the form with a get request

we will add validation as an extra step right in the start of the node code
when we handle the request on the server
definitely before we store it in a database

this validation can then succeed to allow the data 
to be stored in the db or a file or handled by the rest of the node code

or we reject the input and thus return information to the user
prompting the user to correct the error

//we can validate on the client side (optional)
with the help with javascript
that watches the input for key events
or the user typing and checks while the user is filling the form
and then display the error, js can change the dom at runtime
before anything is sent to the server

however the user can see/change/disable that code
so it is not a secure solution but it can improve the user experience

//we can validate on the server side (required)
to filter out invalid values
this code cant be seen / changed / disabled by the user
to store correct data
or return a helpful error message
and never reload the page, but always keep the data the user
already inserted

mongoDB has built in validation (optional) MDB course




///////////////////////////////////////////////////////////////////
//(18.0.1)

- the email address is a valid email address
with an @ and domain
- the password is at least 6 characters long
- the confirm password matched the other password
- can also validate urls when adding a product

to use validation, we will use a third party package
for more info about it check the documentation

# npm install --save express-validator

you will want to validate on the post or non get routes
because you want to validate whenever the user sends data

will start with the postSignup route in auth.js route
- the email address is a valid email address
    with an @ and domain
- the password is at least 6 characters long
- the confirm password matched the other password

> in auth.js route import
express-validator/check
const {check} = require("express-validator")
which is a sub package
which includes all the validation logic you want to add
and de-structure into check
which is a function returns a middleware
pass the ejs email into it and use the .isEmail to check on it

we destruct to get specific things"

> in the auth.js controller
import
const {validationResult} = require("express-validator");
to gather all the errors
//had to remove the /check fom the require as stated in the docs


> in the postSignup controller in auth.js
const errors = validationResult(req);
and render with the flash the error



///////////////////////////////////////////////////////////////////
//(18.0.2)
//to edit the error message
> in the postSignup route in auth.js
has to be done in the middleware after the check in the route
router.post('/signup', check("email").isEmail("Please enter a valid email") ,authController.postSignup);


///////////////////////////////////////////////////////////////////
//(18.0.2)

> in the postSignup route in auth.js
express-validator is a set of express.js middleware
that wraps validator.js validator 
which is another package that was implicitly installed with express validator

and on the validator.js docs can find all the validator methods
like isEmail, what they do and how you can configure them
//you can also add your own validator


//294-300
///////////////////////////////////////////////////////////////////
//(18.0.3)


want to make sure that the password is at least 5 chars long
> in the postSignup route in auth.js
add an extension to the route middleware


///////////////////////////////////////////////////////////////////
//(18.0.4)
checking for passwords equality

in the signup view, name=confirmPassword
> in the postSignup route in auth.js
add an extension to the route middleware


///////////////////////////////////////////////////////////////////
//(18.0.5) Adding async Validation

removed the user.findOne{email: email} 
from the controller postSignup in auth.js

added it to the custom method on email
in the auth.js router postSignup
to return a promise that has a reject message
to be caught by the custom method

we can rely on the user not exist already
inside of the auth.js postSignup controller
because i do check for its existence ahead of time
in the auth.js route with the validation middleware


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//(18.0.6)

add validation the same way we did before
to the login route
and make sure this email address is an email
and the password is a valid password

add validation to postLogin

> edit the postLogin route
> go to the postLogin controller
and add validationResult(req) to gather all the errors passed from the route


check for input errors during validation
check for logical errors in the controller




///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//(18.1.0) keeping the wrong credentials in the form

working on the user experience
to prevent inputs from being lost and keep them
when a user submits wrong credentials during validation


postSignUp controller
where we return a page when wrong data is entered
to return it with the already put in input
in an oldInput object with these values to use in the ejs
also add the oldInput object to the getSignup to avoid undefined errors


299-305
///////////////////////////////////////////////////////////////////
//(18.1.1) give the user input and invalid border


you have to use the information which you are getting
to pass it to your view
and then render something different based on that information

>> allow the postSignUp/getSignUp controller
to pass validationErrors to the render
the get will be an empty array and the post will be errors.array();

>> go to the ejs and will change the styling of inputs
based on the existence of errors

> add to the input
class="<%= validationErrors.find(e => e.path === 'email') ? 'invalid' : '' %>"
find looks in arrays
if not found will return undefined or null
if found then set class to invalid

> add the class to the css

note: all the boxes will be red on wrong signup
unlike the flash error which is displayed for the first wrong only

///////////////////////////////////////////////////////////////////
//keeping credentials and adding validation css for the login page

>> postLogin controller
add the oldInput, empty validationErrors to the render object
instead of flashing then redirecting
return a res.render
and put the flashing message in the errorMassage key

>>getLogin controller
add an empty oldInput, empty validationErrors to the render object

on the ejs 
put for the inputs value = the passed oldLogin

//we did setup that the wrong password gets a red border but wrong emails do not


///////////////////////////////////////////////////////////////////
//(18.1.2)
//sanitizing data (visual) trimming inputs before storing
security sanitizing will be covered later

on the validator library docs that the express-validator use
we can also find sanitizers

for example
can ensure that there is no white space on the left/right
in a string passed by user

can normalize an email, its converted to lowercase with trimming etc.

//to ensure the data you get is not just valid
but also stored in a uniform way


>>go to the auth.js routes, getLogin/getSignup
and chain methods of normalizeEmail() to email and trim() to password




///////////////////////////////////////////////////////////////////
//(18.1.3)

//Validating Product Addition for add-product
to control input and display the error using the express-validator

//title that should be alphanumeric, at least 3 chars long

//imageUrl, valid url, 

//price should be a floating point number - decimal

//description at least 5 characters long


>> go to the admin.js router
import the express validator and destruct into body
>>work on the add-product/edit-product post routes

we start the middleware array by body("ejs-name")


>> go to the admin controller and make sure we 
collect these validation errors and return them

const { validationResult } = require("express-validator");

add if no error, render like the "edit-product"
however will make product key an object with the ejs data
and set a key of hasError to true (also copied as false in the get controller)

>> in the edit-product view
want to render the existing product inputs if i am editing
or if hasError

>> in the edit-product view
add from the login.ejs the if errorMessage to display errorMessage


//make sure each key put in post controllers render to pass info
is put in the get controllers as empty or null to not cause undefined errors

body("title")
//used instead of isAlphanumeric, isString as it allows white spaces
    .isString()


///////////////////////////////
//Validating Product Addition for edit-product
to control input and display the error using the express-validator

>> copy the validation methods array in the router
>>copy the validationErrors if is empty render
to the post edit-product controller
with changing key values to the ones in the controller

Note: we can overwrite the default error message displayed on the website
by using the methods we used before like custom, withMessage, 2nd body argument string

to add the red border css
>>add the validationErrors class line to each input
>> add this to the postEdit/postAdd controller render object
validationErrors: errors.array()
and put it with empty array for the get controllers


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//Wrap up

adding validation to routes with the express-validator and validator
then we collect errors in our controllers
and we do something if we do find errors
render, 
    pass error message(display with div), 
    validationErrors(for if for css),
    oldInputs (for refilling with entered values again)

//there are also other 3rd party validation packages to use








//Section19
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////


//306-312
///////////////////////////////////////////////////////////////////
//(19.0.0)


there will always be errors in your application
if it is not from your code it can be
from the users inputs, server issues

- different types of errors
- handling errors in an elegant way in the nodejs application

errors are not necessarily the end of your app
you just need to handle errors correctly

- technical/Network errors 
    > e.g mongoDB server is down 
    > show error page to user / send email to system administrator
- expected errors
    > file cant be read, database operation fails
    > inform user, possibly retry
- bugs/logical errors
    > interact with user object that does not exist
    > fix during development


How can we work with the different types of errors
a) error is thrown (the error is a technical object in a node application)
                    there is a built in error object which we can throw
                    it is also a js programming feature, most languages have it
    synchronous code: try-catch
    asynchronous code: then(), catch()
    for both ways we decide if 
    -directly handle the error
    -use express error handling function 
    (mechanism built into express, a special error handling middleware)

b) no error is thrown (we cant continue with our code but there is no technical error)
    validate values (with if checks for example)
    and decide whether we want to
    -throw error
    -directly handle error (add some code that can continue with the missing input data )


c) in both ways we can
-return an error page, dedicated page informs the user we have a problem (last resort)
-return the page the user was on kept the input values and just added an error message
-redirect
-intended page/response with error information



///////////////////////////////////////////////////////////////////
//(19.0.1)

//try and catch, to handle sync code errors

in auth.js router signup confirm password
we throw an error that is handled behind the scenes with the express validator

let us add code that is not handled behind the scenes
> create error-playground.js in the root directory

where we throw an error in a normal sync function
and call the function in a try block, 
block chained with catch(error) block to do something when an error happens


//we also have async operations that can fail
//and with using promises errors are handled with then and catch
catch do catch all errors that are thrown by any prior then blocks
and will fire on any error thrown on any then block


///////////////////////////////////////////////////////////////////
//(19.0.2)


//let us see in our application how we can improve error handling
>> in app.js we have 2 catch blocks, work on the first

validating the inputs in the routes
is a form of error handling

//better error handling
//returning the same page, giving the user an error message, user can try again
>> in the admin controller post add product
in the catch block we will return render to the add-product page
with status code 500


//
sometimes you do not want to do that, 
and want to send the user to a page saying that something is wrong
and you are not able to continue

error handling page
> add a new view 500.ejs like the 400.ejs
> add in the error.js controller get500 like the get404 middleware
> add route app.get("/500", errorController.get500); in app.js beside 404
> in the catch block of admin.js add-product, redirect to /500
now the created-database-error redirects to the 500 page
and this can be a decent way of handling errors for bigger problems

//312-318
///////////////////////////////////////////////////////////////////
//(19.0.3) central error handling middleware in app.js
to redirect any middleware error to the 500 status code page

instead of redirecting we can throw a new error

in the post addProduct controller in the catch block
return next(new Error(err).httpStatusCode=500);

in the app.js add a middleware with an extra error argument
which will be evoked by the return next(error) in any middleware

we still have our if statements in the controllers
to handle errors
and the return next error object is the last resort
if everything else fails

>>add the return next error-object to all catch blocks in all 
controller middleware's in the project

the idea is to show to the user something when something fails
instead of doing nothing or console to non end users


////////////////////////////////
//sync vs async code part errors

in the user middleware in app.js
we throw new Error(err);
and to make it reach the error handling middleware in app.js

1) make the error handling middleware render the 500 not redirect
2) to throw a test throw new Error ("Dummy");
it has to be outside of async code, outside .then/.catch blocks
in the middleware
this way the dummy error could reach 500 page

Note: 
so in sync code errors we could throw new Error("..")
in async parts (then) for any throw new Error or code error to go to 500 page 
    in the (catch) return next(new Error(err).httpStatusCode=500); //(19.0.3)

async: promise, then/catch, callbacks


///////////////////////////////////////////////////////////////////
//(19.0.4)

errors and http response/status codes

which codes do we have and why do we use them

the codes are extra information we pass to the browser
which helps the browser understand if an operation succeeded or not

if you are writing an application with alot of client side js
or a mobile app, 
and will fetch only data instead of complete html pages
(will do that in the REST module later)

status codes help to understand if an error happened
what kind of error
because you typically map certain kinds of errors
to certain kinds of status codes

some of the codes available we use
//2XX (Success status code, operation succeeded)
    //200: operation succeeded
    //201: Success also but when we created a resource

//3XX (Redirection happened)
    //301: moved permanently

//4XX (Client-side error, error done by the client)
    //401 not authenticated
    //403 not authorized
    //404 page not found
    //422 invalid input

//5XX (Server-side error occured)
    //500 server-side error
    //also have other codes for timeout and so on


the default is always 200
like when we use res.render which no status code set on

res.redirect will use 300 code
even if put a status, this status will be overwritten by 300

these status codes does not mean that our app crashes or request failed
we have some problem and we are returning information with the problem
to the client


status codes can be viewed in dev tools > network > names

in REST
we will have direct interactions with our requests
because we will not render pages all the time
and then we can get useful information from these status codes


Which status codes are available? 
MDN has a nice list: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
also https://httpstatuses.com/



///////////////////////////////////////////////////////////////////
Wrap up

we looked at the different types of errors and how we can handle them














*/