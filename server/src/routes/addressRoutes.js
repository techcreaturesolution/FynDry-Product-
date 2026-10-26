import express from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../validators/addressValidator.js';

const router = express.Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', validate(createAddressSchema), createAddress);
router.patch('/:id', validate(updateAddressSchema), updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
