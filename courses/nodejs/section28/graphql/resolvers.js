
//you need a method for every query you define in your schema
//and the name has to match
//(28.0.2)
/*
module.exports = {
    hello() {
        return {
            text: "Hello World!",
            views: 1245
        }
    }
}
*/


//(28.0.3)
//import the mongoose user model
//as we will still interact with the database
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const validator = require("validator"); //(28.0.5)

const jwt = require("jsonwebtoken");     //(28.1.1) 

const Post = require("../models/post"); //(28.1.2) 

const {clearImage} = require("../util/file"); //(28.1.11)


//the inputs will be the user input data
//args object, request
//using the args which is the args of the schema UserInputData
//can retrieve email, name, password
//args will have a userInput field which will have these properties
/*
module.exports = {
    createUser(args, req) {
        const email = args.userInput.email;
    }
}
*/

//can also use destructuring to get userInput out of the args object

//need to use the async/await syntax
//to do that need to change the way this method is written

//find in the database User with email

//if will use fineOne without async/await, then have to 
//return it and put .then/.catch
//if you do not return the promise in the resolver
//graphQL will not wait for it to resolve
//when using async await, it automatically gets returned for you

module.exports = {
    createUser : async function ({userInput}, req) {

        ////////////////////////////////////////////////////
        //(28.0.5) validation, checking on validity of inputs
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({message: "E-Mail is invalid"});
        }

        //if password is empty or not long enough
        if (validator.isEmpty(userInput.password) || 
        !validator.isLength(userInput.password, {min: 5})) {

            errors.push({message: "Password too short!"});
        }
        
        if (errors.length > 0) {
           const error = new Error("invalid input");
            error.data = errors; //(28.0.6)
            //on the error get created here
            //can add a data field, which is my array of errors
            error.code = 422;
            //add a code, or come up with own coding system not limited to http

           throw error; 
        }
        ////////////////////////////////////////////////////


        //const email = userInput.email;
        const existingUser = await User.findOne({
            email: userInput.email
        })

        if (existingUser) {
            const error = new Error("User exists already");
            throw error;
        }

        //if email not exist, store user in the db
        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPw
        })

        const createdUser = await user.save();

        //return some data as defined in the schema
        return {
            //contains just the user data, 
            //without all the meta data mongoose would add otherwise
            ...createdUser._doc,
            //overwrite the mongoose id field
            //by pulling as a separate property and pulling out of
            //the _doc, because need to convert it from
            //an object id field to a string field
            _id: createdUser._id.toString()

        }
    },
    //(28.1.1) 
    // de-construct from args
    //email and password as defined in the RootQuery in schema
    login: async function({email, password}) {

        //find the user with the correct email address
        //then confirm the password
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error("User not found.");
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Password is incorrect");
            error.code = 401;
            throw error;
        }

        //email exists, password is correct
        //the data want to encode in the token, key, expiry
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, "secret", {expiresIn: "1h"});

        //return token: as defined in the schema
        return {token: token, userId: user._id.toString()};
    },

    //(28.1.2) 
    //postInput which is defined in the schema,
    //will need req later to get the user data 
    createPost: async function ({postInput}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue


        ////////////////////////////////////////////////////
        //title validation
        const errors = [];
        if (validator.isEmpty(postInput.title) ||
        !validator.isLength(postInput.title, {min: 5})) {

            errors.push({message: "Title is invalid"});
            
        }

        //content validation
        if (validator.isEmpty(postInput.content) ||
        !validator.isLength(postInput.content, {min: 5})) {

            errors.push({message: "Content is invalid"});
            
        }

        //
        if (errors.length > 0) {
            const error = new Error("invalid input");
             error.data = errors; //(28.0.6)
             //on the error get created here
             //can add a data field, which is my array of errors
             error.code = 422;
             //add a code, or come up with own coding system not limited to http
 
            throw error; 
        }
        ////////////////////////////////////////////////////

        //(28.1.3)
        //get a user
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Invalid user");
            error.code = 401;
            throw error;
        }





        //input is valid, can create a new post

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user         //(28.1.3)
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);         //(28.1.3)
        await user.save();  //to save the user with the created post pushed

        //add post to user's post

        //getting all the data from the created post doc
        //overwrite the id, cant return the mongoDB object id
        //need to return a string
        //overwrite createdAt, updatedAt
        //because these will be stored as data types
        //graphql does not understand that, so need to convert to a string
        return {
            ...createdPost._doc, 
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()   
        }
    },

    //(28.1.5) 
    //will not care about the first argument for now
    //but will need req, to check whether the user is authenticated
    //(28.1.7) 
    //the page argument is the argument in the schema for posts
    posts: async function ({page}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue
        //later will add pagination logic

        //(28.1.7)
        //adding pagination
        if (!page) {
            page = 1;
        }
        const perPage = 2;




        const totalPosts = await Post.find().countDocuments();
        //sort by createdAt in descending order
        //fetch all creator data with name etc. to be used on the front end
        const posts = await Post
        .find()
        .sort({createdAt: -1})
        .skip((page -1)* perPage)            //(28.1.7)
        .limit(perPage)                      //(28.1.7)
        .populate("creator");

        //return an object like the defined in schema
        //posts will be returned with _id etc that is not
        //understood by GQL, so will use map
        //return a new object for every post

        return {posts: posts.map(p => {
            return {
                ...p._doc, 
                _id: p._id.toString(),
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString()   
            }
        }), totalPosts: totalPosts};

    },


    //(28.1.9) view a single post
    post: async function ({id}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue

        //find post, with user populate
        const post = await Post.findById(id).populate("creator");

        //check if there is a post
        if (!post) {
            const error = new Error("No post found");
            error.code = 404;
            throw error;
        }
        //if there is a post continue

        return {
            //get all the data for that post
            ...post._doc,
            //these individual returns will overwrite what in _doc
            _id: post._id.toString(),
            //return createdAt because cant return dates
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        };
    },

    //(28.1.9) view a single post
    updatePost: async function ({id, postInput}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue

        const post = await Post.findById(id).populate("creator");
        
        if (!post) {
            const error = new Error("No post found");
            error.code = 404;
            throw error;
        }

        //check if the current user is the user who created the post
        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error("Not Authorized");
            error.code = 403;
            throw error;
 
        }


        //validation code copied from createPost
        ////////////////////////////////////////////////////
        //title validation
        const errors = [];
        if (validator.isEmpty(postInput.title) ||
        !validator.isLength(postInput.title, {min: 5})) {

            errors.push({message: "Title is invalid"});
            
        }

        //content validation
        if (validator.isEmpty(postInput.content) ||
        !validator.isLength(postInput.content, {min: 5})) {

            errors.push({message: "Content is invalid"});
            
        }

        //
        if (errors.length > 0) {
            const error = new Error("invalid input");
             error.data = errors; //(28.0.6)
             //on the error get created here
             //can add a data field, which is my array of errors
             error.code = 422;
             //add a code, or come up with own coding system not limited to http
 
            throw error; 
        }
        ////////////////////////////////////////////////////


        post.title = postInput.title;
        post.content = postInput.content;

        //if there is a new image, only then overwrite post's image 
        if (postInput.imageUrl !== "undefined") {
            post.imageUrl = postInput.imageUrl;

        }

        const updatedPost = await post.save();

        return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        };
    },

    deletePost: async function ({id}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue


        const post = await Post.findById(id);

        if (!post) {
            const error = new Error("No post found");
            error.code = 404;
            throw error;
        }

        //check if the current user is the user who created the post
        //as creator is not populated by the findById
        //the creator is just the id
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error("Not Authorized");
            error.code = 403;
            throw error;
        }

        //remove image, remove post
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(id);

        //remove the post from the user model by its id using pull
        //can access the req because of the Auth middleware added earlier
        const user = await User.findById(req.userId);
        user.posts.pull(id);
        await user.save();

        //as defined in schema want to return a boolean
        return true;



    },

    //(28.1.12)
    //i do not get any specific argument, so will use empty args
    user: async function (args, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("User not found");
            error.code = 404;
            throw error;

        }

        return {...user._doc, _id: user._id.toString()};

    },

    //(28.1.12)
    updateStatus: async function ({status}, req) {

        //(28.1.3)
        //user not authenticated, not want to grant access
        //to creating a post
        if (!req.isAuth) {
            const error = new Error("Not authenticated");
            error.code = 401;
            throw error;
        }
        //if the user is authenticated, we can continue

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("User not found");
            error.code = 404;
            throw error;

        }


        user.status = status;
        await user.save();
        return {...user._doc, _id: user._id.toString()};






    }





////
}
