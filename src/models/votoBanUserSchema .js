const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  targetUserId: {
    type: String,
    required: true
  }, // ID do usuário votado
  targetUsername: {
    type: String,
    required: true 
  }, // Nome do usuário votado
  targetAvatarUrl: {
    type: String,
    required: true
  }, // URL do avatar do usuário votado
  startedBy: {
    type: String,
    required: true
  }, // ID de quem iniciou a votação
  startTime: {
    type: Date,
    default: Date.now
  }, // Hora de início da votação
  endTime: {
    type: Date,
    required: true
  }, // Hora de término da votação
  votes: [ // Lista de votos
    {
      userId: {
        type: String,
        required: true
      }, // ID do usuário que votou
      username: {
        type: String,
        required: true
      }, // Nome do usuário que votou
      vote: {
        type: String,
        enum: ['sim', 'nao'],
        required: true }, // Voto: "yes" ou "no"
    },
  ],
});

module.exports = mongoose.model('Vote', VoteSchema);
