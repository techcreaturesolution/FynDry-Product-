import express from 'express';
import { reverseGeocodeAddress } from '../controllers/addressController.js';
import { validate } from '../middleware/validate.js';
import { reverseGeoSchema } from '../validators/addressValidator.js';

const router = express.Router();

router.post('/reverse', validate(reverseGeoSchema), reverseGeocodeAddress);

export default router;
