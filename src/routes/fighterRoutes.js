const express = require('express');
const fighterController = require('../controllers/fighterController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', fighterController.getFighters);
router.get('/:fighterId', fighterController.getFighterById);
router.post('/:fighterId/image',
  authMiddleware,
  adminAuthMiddleware,
  upload.single('image'),
  fighterController.uploadFighterImage
);
router.delete('/:fighterId/image',
  authMiddleware,
  adminAuthMiddleware,
  fighterController.deleteFighterImage
);

module.exports = router;
