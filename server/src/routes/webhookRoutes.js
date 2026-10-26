import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook endpoint (Signature is verified in the controller)
router.post('/razorpay', handleRazorpayWebhook);

export default router;
