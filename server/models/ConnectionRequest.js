const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    menteeId: { type: String, required: true },
    mentorId: { type: String, required: true },
    menteeName: { type: String, required: true }, // Denormalized for quick frontend display
    mentorName: { type: String, required: true }, // Denormalized for quick frontend display
    selectedSlot: { type: String }, // The time slot chosen by the mentee
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' }
}, { timestamps: true }); // Mongoose timestamps will provide createdAt which we can use for `timestamp`

module.exports = mongoose.models.ConnectionRequest || mongoose.model('ConnectionRequest', connectionRequestSchema);
