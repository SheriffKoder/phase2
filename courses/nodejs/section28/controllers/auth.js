
//(25.2.5)
const User = require("../models/user");
const { validationResult } = require("express-validator");

//(25.2.6)
const bcrypt = require("bcryptjs");

//(25.2.8)
const jwt = require("jsonwebtoken");


exports.signup = async (req, res, next) => {

    //collect any router validation errors from the start
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;


    }


    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password
 
    try {
    const hashedPw = await bcrypt.hash(password, 12)
    //.then((hashedPw) => {
        const user = new User({
            email: email,
            password: hashedPw,
            name:name
        });
        //return user.save();
        const result = await user.save();
    //})
    //.then((result) => {
        res.status(201).json({message: "User Created!", userId: result.id});
    //})
    } catch (err) {
	//.catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);  //async error handling         //(25.0.8)
	//})
    }

}


//(25.2.8)
exports.login = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
    //find if the email address exists
    const user = await User.findOne({email: email})
    //we always end up in the then block if no error is found
    //so we can reach the then with an undefined user
    //.then((user) => {

        //that is why we check again for the user if found in the then
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 401; //not authenticated
            throw error;
        }
        loadedUser = user;
        //return bcrypt.compare(password, user.password)
        const isEqual = await bcrypt.compare(password, user.password)


    //})
    //bcrypt.compare returns true or false
    //.then((isEqual) => {
        if (!isEqual) {
            const error = new Error("User not found");
            error.statusCode = 401; //not authenticated
            throw error;
        }
        //passwords match, generate JSON-Web-token
        //(25.2.8)
        //creates a new signature and pack that in a new web token
        //we can store anything we want in the web token
        //and the second argument is the secret private key
        //third argument to configure the key (will be hashed)
        const token = await jwt.sign({
            email: loadedUser.email,
            //convert to string as it is a mongoDB object
            userId: loadedUser._id.toString()
            //should not store the password as will be returned to the user

        }, "secret", { expiresIn: "1h"}); 
        res.status(200).json({token: token, userId: loadedUser._id.toString()})



    //})
    } catch (err) {
	//.catch((err) => {
		if (!err.statusCode) {
		    err.statusCode = 500;
		}
		next(err);
		//async error handling
		//(25.0.8)
	//})
    }

};


//(25.3.3)
exports.getUserStatus = async (req, res, next) => {
    //
    try {
    const user = await User.findById(req.userId)
	//.then((user) => {
        
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404; //not authenticated
            throw error;
        }

        //have a user
        //know what the front-end is looking for
        //fe trying to extract a status filed from response data resData.status
        res.status(200).json({
            status: user.status
        });


    //})
    } catch (err) {
	//.catch((err) => {
		if (!err.statusCode) {
		    err.statusCode = 500;
		}
		next(err);
		//async error handling
		//(25.0.8)
	//})
    }
};


//(25.3.3)
exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;
    try {
    const user = await User.findById(req.userId)
    //.then((user) => {
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404; //not authenticated
            throw error;
        }

        //have a user
        user.status = newStatus;
        //return user.save();
        await user.save();



	//})
    //.then((result) => {
        res.status(200).json({
            message: "User updated"
        });
	//})
    } catch (err) {
	//.catch((err) => {
		if (!err.statusCode) {
		    err.statusCode = 500;
		}
		next(err);
		//async error handling
		//(25.0.8)
	//})
    }

} 
