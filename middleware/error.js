const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;
    //log to console for developer
    // console.log(err.stack.red);
    /* IMPORTANT
        If you ever want to test for error conditon log error like below
        to see what comes in the error object
    */
    console.log(err);


    // Mongoose bad objectId
    //console.log(err.name);
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    // mongoose duplicate key
    if(err.code === 11000) {
        const message = "Duplicate field value entered";
        error = new ErrorResponse(message, 400)
    }

    // mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;

// to use middleware please add to app.use in server.js