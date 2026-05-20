const PrayerRequest = require('../models/PrayerRequest');

const createPrayerRequest = async (req, res) => {
  const { name, phone, topic } = req.body;
  if (!name || !phone || !topic) {
    return res.status(400).json({ success: false, message: 'Name, phone, and topic are required.' });
  }
  const request = await PrayerRequest.create({ name, phone, topic });
  res.status(201).json({ success: true, request });
};

const getAllPrayerRequests = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const requests = await PrayerRequest.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, total: requests.length, requests });
};

const updatePrayerRequestStatus = async (req, res) => {
  const { status } = req.body;
  if (!['new', 'prayed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const request = await PrayerRequest.findByIdAndUpdate(
    req.params.id, { status }, { new: true }
  );
  if (!request) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, request });
};

const deletePrayerRequest = async (req, res) => {
  const request = await PrayerRequest.findByIdAndDelete(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: 'Not found.' });
  res.json({ success: true, message: 'Deleted.' });
};

module.exports = {
  createPrayerRequest,
  getAllPrayerRequests,
  updatePrayerRequestStatus,
  deletePrayerRequest,
};