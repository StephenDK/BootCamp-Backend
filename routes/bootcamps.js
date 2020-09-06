const express = require('express');
const { getBootcamp,
     getBootcamps, 
     updateBootcamp, 
     createBootcamp, 
     deleteBootcamp,
     getBootcampsInRadius,
     bootcampPhotoUpload
    } = require('../controllers/bootcamps')

const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses');
// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// CRUD Routes Below
router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

// Geocode bootcamps within radius Below
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

// Route to upload a file
router.route('/:id/photo').put(bootcampPhotoUpload)

module.exports = router;