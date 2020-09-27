const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
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

// Use the express-mongo-sanitize package middlware
// to prent noSQL injections
app.use(mongoSanitize())

//  Set security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Prevent XSS attacks ie embeding html tags into the db
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
})

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// import route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//Mount routes to app
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);


// errorhandler middleware
app.use(errorHandler);


//Below is just some homemade middleware
// app.use(logger);


const PORT = process.env.PORT || 6000;


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
