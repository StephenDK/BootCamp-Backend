const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
//custom logger
//const logger = require('./middleware/logger')
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();


const app = express();
//body parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// import route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
//Mount routes to app
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);


// errorhandler middleware
app.use(errorHandler);




//Below is just some homemade middleware
// app.use(logger);



const PORT = process.env.PORT || 5000;


const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
    );

//handle unhandled rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`ERROR: ${err.message}`.red)
    //close server & exit process
    server.close(() => process.exit(1));
})
