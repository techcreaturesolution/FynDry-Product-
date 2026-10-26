import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

const isSmtpConfigured = Boolean(ENV.SMTP_USER && ENV.SMTP_PASS);

if (isSmtpConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } catch (err) {
    console.warn('[Mailer] Initialization warning:', err.message);
  }
}

/**
 * Generic non-blocking send mail helper
 */
async function sendMailSafe({ to, subject, html, text }) {
  if (!to) return;

  if (!isSmtpConfigured || !transporter) {
    console.log(`[Mailer: SIMULATION] Email to ${to} | Subject: "${subject}"`);
    return;
  }

  try {
    await transporter.sendMail({
      from: ENV.SMTP_FROM,
      to,
      subject,
      text: text || subject,
      html,
    });
    console.log(`[Mailer] Successfully sent email to ${to} ("${subject}")`);
  } catch (error) {
    console.error(`[Mailer Warning] Failed to deliver email to ${to}:`, error.message);
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order, userEmail) {
  const recipient = userEmail || order.shippingAddress?.email;
  if (!recipient) return;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong> (${item.variantLabel || 'Standard'})<br/>
          <span style="font-size: 12px; color: #666;">Qty: ${item.quantity} × ₹${item.price}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
          ₹${item.lineTotal}
        </td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF8E7; border-radius: 8px; overflow: hidden; border: 1px solid #E8DCC4;">
      <div style="background-color: #1F6B3A; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="margin: 0; font-size: 26px; font-family: 'Baloo 2', Arial, sans-serif;">FynDry</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Goodness, Naturally Preserved</p>
      </div>
      <div style="padding: 24px; color: #333333; background: #ffffff;">
        <h2 style="color: #1F6B3A; margin-top: 0;">Thank You for Your Order!</h2>
        <p>Your order <strong>${order.orderNumber}</strong> has been received and is being prepared.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #F4EAD4; color: #1F6B3A; text-align: left;">
              <th style="padding: 10px;">Item</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 8px 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 8px 10px; text-align: right;">₹${order.pricing?.subtotal || 0}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; text-align: right; font-weight: bold;">Delivery Fee:</td>
              <td style="padding: 8px 10px; text-align: right;">${order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</td>
            </tr>
            <tr style="font-size: 16px; color: #1F6B3A;">
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #1F6B3A;">Grand Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #1F6B3A;">₹${order.pricing?.total || 0}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #FFF8E7; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h3 style="margin: 0 0 8px 0; color: #8B5A2B; font-size: 15px;">Delivery Address</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            <strong>${order.shippingAddress?.fullName}</strong> (${order.shippingAddress?.phone})<br/>
            ${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.addressLine2 || ''}<br/>
            ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}
          </p>
        </div>
      </div>
      <div style="background: #F4EAD4; padding: 16px; text-align: center; font-size: 12px; color: #666666;">
        Questions? Contact us at support@fyndry.com<br/>
        © ${new Date().getFullYear()} FynDry. All rights reserved.
      </div>
    </div>
  `;

  sendMailSafe({
    to: recipient,
    subject: `Order Confirmed: ${order.orderNumber} - FynDry`,
    html,
  });
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(order, userEmail, note = '') {
  const recipient = userEmail || order.shippingAddress?.phone;
  if (!recipient || !recipient.includes('@')) return;

  const trackingInfo = order.trackingId
    ? `<div style="background: #E8F5E9; padding: 12px; border-radius: 6px; margin: 15px 0;">
        <strong>Courier:</strong> ${order.courierName || 'Standard Express'}<br/>
        <strong>Tracking ID:</strong> ${order.trackingId}
       </div>`
    : '';

  const html = `
    <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E8DCC4;">
      <div style="background-color: #1F6B3A; padding: 20px; text-align: center; color: #FFFFFF;">
        <h2 style="margin: 0;">FynDry Order Update</h2>
      </div>
      <div style="padding: 24px; color: #333333;">
        <p>Hello <strong>${order.shippingAddress?.fullName}</strong>,</p>
        <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to:</p>
        <div style="display: inline-block; padding: 8px 16px; background: #1F6B3A; color: #ffffff; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 14px;">
          ${order.orderStatus.replace(/_/g, ' ')}
        </div>
        ${note ? `<p style="margin-top: 15px; color: #555;"><em>Note: ${note}</em></p>` : ''}
        ${trackingInfo}
        <p style="margin-top: 20px;">You can track your order status anytime in your FynDry account dashboard.</p>
      </div>
    </div>
  `;

  sendMailSafe({
    to: recipient,
    subject: `Order Update: ${order.orderNumber} is now ${order.orderStatus.toUpperCase()} - FynDry`,
    html,
  });
}

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
};
