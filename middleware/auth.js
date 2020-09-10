// Protect routes middlware
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async(req, res, next) => {
    let token;

    // check headers for authorization
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Code below uses cookie instead of headers like above
    // else if(req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make sure token is exists
    if (!token) {
        return next(new errorResponse('Not authorized to access this route', 401))
    }

    try {
        // Verify Token  Example of token payload { id: iat:xxx exp}
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        // The decoded object will have to user id
        // req,user will always be the current logged in user
        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return next(new errorResponse('Not authorized to access this route', 401));    
    }
})

// head to routes/bootcamp to implement protect middleware