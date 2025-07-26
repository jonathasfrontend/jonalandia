const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  targetUserId: {
    type: String,
    required: true
  },
  targetUsername: {
    type: String,
    required: true 
  },
  targetAvatarUrl: {
    type: String,
    required: true
  },
  startedBy: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  votes: [
    {
      userId: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      vote: {
        type: String,
        enum: ['sim', 'nao'],
        required: true },
    },
  ],
});

module.exports = mongoose.model('onVotoBanUserSchema', VoteSchema);
