const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.status(200).json({success: true, msg: 'Show all boot camps'});
})

router.put('/:id', (req, res) => {
    res.status(200).json({success: true, msg: `Update boot camp ${req.params.id}`});
})

router.get('/:id', (req, res) => {
    res.status(200).json({success: true, msg: `Show boot camp ${req.params.id}`});
})

router.delete('/:id', (req, res) => {
    res.status(200).json({success: true, msg: `Delete boot camp ${req.params.id}`});
})

router.post('/', (req, res) => {
    res.status(200).json({success: true, msg: 'Create new boot camps'});
})


module.exports = router;