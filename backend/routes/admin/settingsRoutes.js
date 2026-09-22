const { Router } = require('express');
const c = require('../../controllers/admin/settingsController');

const router = Router();

router.get('/', c.get);
router.patch('/', c.update);
router.get('/public', c.getPublic);
router.get('/features', c.features);
router.patch('/features', c.updateFeatures);

module.exports = router;