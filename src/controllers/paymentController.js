const { initializeTransaction, verifyTransaction } = require('../services/paystackService');
const { MIN_OFFERING_GHS } = require('../config/constants');
const crypto = require('crypto');

// ─── Bypass conditions ────────────────────────────────────────────────────────
// Bypass Paystack when ANY of these are true:
//   1. NODE_ENV is not 'production'
//   2. BYPASS_PAYMENT env var is 'true'
//   3. Paystack key is still the placeholder value
const isPaystackConfigured =
  process.env.PAYSTACK_SECRET_KEY &&
  !process.env.PAYSTACK_SECRET_KEY.includes('your_paystack');

const isBypassMode =
  process.env.NODE_ENV !== 'production' ||
  process.env.BYPASS_PAYMENT === 'true' ||
  !isPaystackConfigured;

// ─── POST /api/payments/initialize ───────────────────────────────────────────
const initializePayment = async (req, res) => {
  const { name, phone, email, amount } = req.body;

  if (!name || !phone || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, and amount are required.',
    });
  }

  if (Number(amount) < MIN_OFFERING_GHS) {
    return res.status(400).json({
      success: false,
      message: `Minimum offering is GHS ${MIN_OFFERING_GHS}.`,
    });
  }

  // ── BYPASS MODE — instant redirect, no Paystack call ──────────────────────
  if (isBypassMode) {
    const devRef = `DEV-${Date.now()}`;
    return res.json({
      success: true,
      authorizationUrl: `${process.env.FRONTEND_URL}/submission?ref=${devRef}`,
      reference: devRef,
    });
  }

  // ── PRODUCTION — real Paystack transaction ─────────────────────────────────
  const payerEmail  = email || `${phone.replace(/\s/g, '')}@dreamapp.com`;
  const reference   = `DREAM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  const callbackUrl = `${process.env.FRONTEND_URL}/submission?reference=${reference}`;

  const data = await initializeTransaction({
    email: payerEmail,
    amount: Number(amount),
    reference,
    callbackUrl,
    metadata: { name, phone, email },
  });

  res.json({
    success: true,
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
};

// ─── GET /api/payments/verify/:reference ─────────────────────────────────────
const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  // Always auto-verify DEV- prefixed references
  if (reference.startsWith('DEV-')) {
    return res.json({
      success: true,
      verified: true,
      reference,
      amount: MIN_OFFERING_GHS,
      payer: { name: 'Test User', phone: '0000000000' },
    });
  }

  // Bypass mode — auto verify
  if (isBypassMode) {
    return res.json({
      success: true,
      verified: true,
      reference,
      amount: MIN_OFFERING_GHS,
      payer: { name: 'Test User', phone: '0000000000' },
    });
  }

  // PRODUCTION — verify with Paystack
  const data = await verifyTransaction(reference);

  if (data.data.status !== 'success') {
    return res.status(400).json({ success: false, message: 'Payment not successful.' });
  }

  const amountPaid = data.data.amount / 100;

  res.json({
    success: true,
    verified: true,
    reference,
    amount: amountPaid,
    payer: data.data.metadata,
  });
};

module.exports = { initializePayment, verifyPayment };