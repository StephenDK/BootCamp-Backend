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
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);


// CRUD Routes Below
router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// Geocode bootcamps within radius Below
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

// Route to upload a file
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router;