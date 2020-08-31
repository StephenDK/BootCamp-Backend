// Models
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // Getting query params
    // Example of a query params /api/v1/bootcamps/?location.state=MA&housing=true
    // console.log(req.query);

    // Setting up selecting and sorting
    // copy req.query
    const reqQuery = {...req.query}
    // console.log('18. reqQuery ', reqQuery)
    
    // Fields to exclude
    const removeFields = ['select', 'sort']
    // console.log(removeFields);
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    // console.log(removeFields);

    // // Query mongodb using greater then and less then
    let query;

    // Take the query object and stringify it.
    let queryStr = JSON.stringify(reqQuery);
    // console.log('32. QUERY STRING BEFORE: ',typeof(queryStr), queryStr);
    // console.log(queryStr);
    // Take the string and replace a $ before the query selector
 
    // Name	Description
    // $eq	Matches values that are equal to a specified value.
    // $gt	Matches values that are greater than a specified value.
    // $gte	Matches values that are greater than or equal to a specified value.
    // $in	Matches any of the values specified in an array.
    // $lt	Matches values that are less than a specified value.
    // $lte	Matches values that are less than or equal to a specified value.
    // $ne	Matches all values that are not equal to a specified value.
    // $nin	Matches none of the values specified in an array.
   
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // console.log('47. QUERY STRING: AFTER', typeof(queryStr), queryStr);
    

    // console.log('51. QUERYSTR: ', JSON.parse(queryStr));
    query = Bootcamp.find(JSON.parse(queryStr));
    // console.log(Object.keys(query));

    // console.log('req.query.select: ', req.query.select);
    //Select Felds
    if (req.query.select) {
        // URL selection example
        // /api/v1/bootcamps?select=name,description,housing
        const fields = req.query.select.split(',').join(' ');
        // console.log('57. fields: ',fields);
        // console.log(query);
        query = query.select(fields);
        // console.log(query);
    }

    // Sort
    if (req.query.sort) {
        // Sort URL example
        // /api/v1/bootcamps?select=name,description,housing&sort=name
        // for decending put - in front of the sort=-name
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const bootcamps = await query;
    console.log(bootcamps)
    res
        .status(200)
        .json({ success: true, count: bootcamps.length, data: bootcamps});

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
   
    // console.log(req.body);
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
    
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    // make sure bootcamps exists
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res
        .status(200)
        .json({success: true, data: bootcamp});
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

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