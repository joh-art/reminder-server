// Import your Reminderforms model
const Reminderforms = require('../models/ReminderModel');
// Create a new Reminderforms record
 const createReminderform = async (req, res, next) => {
  const newReminderform = new Reminderforms(req.body);

  try {
    const savedReminderform = await newReminderform.save();
    res.status(200).json(savedReminderform);
  } catch (err) {
    next(err);
  }
};

// Update a Reminderforms record by ID
 const updateReminderform = async (req, res, next) => {
  try {
    const updatedReminderform = await Reminderforms.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedReminderform);
  } catch (err) {
    next(err);
  }
};

// Delete a Reminderforms record by ID
 const deleteReminderform = async (req, res, next) => {
  try {
    await Reminderforms.findByIdAndDelete(req.params.id);
    res.status(200).json("Reminderform has been deleted.");
  } catch (err) {
    next(err);
  }
};

// Get a Reminderforms record by ID
 const getReminderform = async (req, res, next) => {
  try {
    const reminderform = await Reminderforms.findById(req.params.id);
    res.status(200).json(reminderform);
  } catch (err) {
    next(err);
  }
};

// Get a list of Reminderforms records with optional filters
 const getReminderforms = async (req, res, next) => {
  const { min, max, ...others } = req.query;
  try {
    const reminderforms = await Reminderforms.find({
      ...others,
      date: { $gte: min || new Date(0), $lte: max || new Date() },
    }).limit(req.query.limit);
    res.status(200).json(reminderforms);
  } catch (err) {
    next(err);
  }
};
