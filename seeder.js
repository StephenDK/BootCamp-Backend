// This file seeds our database with data
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


//load env vars
dotenv.config({ path: './config/config.env' });


// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
// console.log(bootcamps);

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        // await Course.create(courses)
        console.log('Data Imported....'.green.inverse);
        //exit process
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany()
        console.log('Data Deleted....'.red.inverse);
        //exit process
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === '-i') {
    // node seeder -i (seed database)
    importData();
} else if (process.argv[2] === '-d') {
    // node seeder -d (delete data)
    deleteData();
}