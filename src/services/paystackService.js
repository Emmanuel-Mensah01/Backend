const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';

const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

// Initialize a transaction
const initializeTransaction = async ({ email, amount, reference, callbackUrl, metadata }) => {
  const response = await axios.post(
    `${PAYSTACK_BASE}/transaction/initialize`,
    {
      email,
      amount: Math.round(amount * 100), // Paystack uses pesewas (kobo equivalent)
      reference,
      callback_url: callbackUrl,
      currency: 'GHS',
      metadata,
    },
    { headers: paystackHeaders() }
  );
  return response.data;
};

// Verify a transaction
const verifyTransaction = async (reference) => {
  const response = await axios.get(
    `${PAYSTACK_BASE}/transaction/verify/${reference}`,
    { headers: paystackHeaders() }
  );
  return response.data;
};

module.exports = { initializeTransaction, verifyTransaction };