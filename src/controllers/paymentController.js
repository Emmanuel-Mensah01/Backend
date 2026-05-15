const { initializeTransaction, verifyTransaction } = require('../services/paystackService');
const { MIN_OFFERING_GHS } = require('../config/constants');
const crypto = require('crypto');

const isDev = process.env.NODE_ENV !== 'production';

// POST /api/payments/initialize
const initializePayment = async (req, res) => {
  const { name, phone, email, amount } = req.body;

  if (!name || !phone || !amount) {
    return res.status(400).json({ success: false, message: 'Name, phone, and amount are required.' });
  }

  if (Number(amount) < MIN_OFFERING_GHS) {
    return res.status(400).json({
      success: false,
      message: `Minimum offering is GHS ${MIN_OFFERING_GHS}.`,
    });
  }

  // DEV MODE — bypass Paystack completely
  if (isDev) {
    const devRef = `DEV-${Date.now()}`;
    return res.json({
      success: true,
      authorizationUrl: `${process.env.FRONTEND_URL}/submission?ref=${devRef}`,
      reference: devRef,
    });
  }

  // PRODUCTION — use real Paystack
  const payerEmail = email || `${phone.replace(/\s/g, '')}@dreamapp.com`;
  const reference = `DREAM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
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

// GET /api/payments/verify/:reference
const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  // DEV MODE — auto verify
  if (isDev && reference.startsWith('DEV-')) {
    return res.json({
      success: true,
      verified: true,
      reference,
      amount: 50,
      payer: { name: 'Dev User', phone: '0000000000' },
    });
  }

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