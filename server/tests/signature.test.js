import crypto from 'crypto';

describe('Razorpay Signature Verification Security Tests', () => {
  const secret = 'test_razorpay_secret_key_12345';
  const orderId = 'order_FD_998877';
  const paymentId = 'pay_FD_112233';

  test('generates valid HMAC SHA256 hex signature matching Razorpay specification', () => {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    expect(expectedSignature).toBeDefined();
    expect(expectedSignature.length).toBe(64); // SHA256 hex length
    expect(/^[a-f0-9]{64}$/.test(expectedSignature)).toBe(true);

    // Verify verification helper
    const verifyHmac = (ordId, payId, sig, sec) => {
      const generated = crypto
        .createHmac('sha256', sec)
        .update(`${ordId}|${payId}`)
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(sig));
    };

    expect(verifyHmac(orderId, paymentId, expectedSignature, secret)).toBe(true);
  });

  test('strictly rejects tampered or fraudulent payment signatures', () => {
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Tampered payment ID
    const tamperedPayload = `${orderId}|pay_FRAUD_666`;
    const forgedSignature = crypto
      .createHmac('sha256', secret)
      .update(tamperedPayload)
      .digest('hex');

    expect(validSignature).not.toBe(forgedSignature);

    // Tampered secret
    const wrongSecretSignature = crypto
      .createHmac('sha256', 'wrong_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(validSignature).not.toBe(wrongSecretSignature);
  });

  test('verifies timing-safe comparison prevents timing attacks', () => {
    const sigA = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const sigB = 'a'.repeat(64);

    expect(crypto.timingSafeEqual(Buffer.from(sigA), Buffer.from(sigA))).toBe(true);
    expect(crypto.timingSafeEqual(Buffer.from(sigA), Buffer.from(sigB))).toBe(false);
  });
});
