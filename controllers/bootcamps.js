// Models
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
   

    res
        .status(200)
        .json(res.advancedResults);

});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findById(req.params.id);
    
    //if their is no data for req id
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    // this return an success: false incase their is not data matching the object id
    res
        .status(200)
        .json({ success: true, data: bootcamp});

    
});
// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    
    // The user is on the req.user because of the middleware
    // now add the user to the req.body
    req.body.user = req.user.id;
    // console.log(req.body);

    // A publishged user can only add one bootcamp
    // check for that scenario
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    // If the user is not an admin they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next( new ErrorResponse(`The user with id ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    })
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    
    let bootcamp = await Bootcamp.findById(req.params.id);
    // make sure bootcamps exists
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next( new ErrorResponse(`User ${req.params.id} is not authorizrd to update this bootcamp`, 401))
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })


    res
        .status(200)
        .json({success: true, data: bootcamp});
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    // The pre middleware for deleting courses associated with a bootcamp
    // wont work with findByIdAndDelete
    // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next( new ErrorResponse(`User ${req.params.id} is not authorizrd to delete this bootcamp`, 401))
    }

    // Then we call .remove on the bootcamps
    // The remove method will trigger the cascading remove of courses when a bootcamp
    // is deleted
    bootcamp.remove();

    res
        .status(200)
        .json({ success: true, data: {} })

});

// @desc    Get bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth radius is 3,963 mi / 6,378 km
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [ [lng, lat], radius ] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});



// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

     // Make sure user is the bootcamp owner
     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next( new ErrorResponse(`User ${req.params.id} is not authorizrd to update this bootcamp`, 401))
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 404))
    }

    // console.log(req.files);
    // console.log(req.files.file);
    const file = req.files.file

    // Make sure the image is a photo using mimetype
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 404))        
    }
    
    // check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 404)
        )                
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    console.log(file.name)

    // Move the file to the selected directory
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(
                new ErrorResponse('Problem with file upload', 500)
            )
        }

        // insert the filename into the database
        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        })

        // Send response
        res.status(200).json({success: true, data: file.name})
    });
});

