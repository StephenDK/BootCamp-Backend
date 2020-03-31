const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;
    //log to console for developer
    // console.log(err.stack.red);

    // Mongoose bad objectId
    //console.log(err.name);
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;

// to use middleware please add to app.use in server.js