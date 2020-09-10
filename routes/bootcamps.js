const express = require('express');
const { getBootcamp,
     getBootcamps, 
     updateBootcamp, 
     createBootcamp, 
     deleteBootcamp,
     getBootcampsInRadius,
     bootcampPhotoUpload
    } = require('../controllers/bootcamps')

const advancedResults = require('../middleware/advancedResults');
const Bootcamp = require('../models/Bootcamp');

// Protect route middleware
const { protect } = require('../middleware/auth');

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses');
// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// CRUD Routes Below
router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp);

// Geocode bootcamps within radius Below
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

// Route to upload a file
router.route('/:id/photo').put(protect, bootcampPhotoUpload)

module.exports = router;