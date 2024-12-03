const { PresenceUpdateStatus } = require('discord.js');
const User = require('../models/rankingUserSechema');

const cooldowns = new Set();
const voiceCooldowns = new Set();
const cooldownPresence = new Set();

async function updateUserStats(user, xp, coins, gems) {
  try {
    xp = isNaN(xp) || xp === undefined ? 0 : Math.floor(xp);
    coins = isNaN(coins) || coins === undefined ? 0 : Math.floor(coins);
    gems = isNaN(gems) || gems === undefined ? 0 : Math.floor(gems);

    const userData = await User.findOneAndUpdate(
      { userId: user.id },
      {
        $set: { username: user.username },
        $inc: { xp, coins, gems },
      },
      { new: true, upsert: true }
    );

    console.log(`Atualizado: ${userData.username} - XP: ${userData.xp}, Moedas: ${userData.coins}, Gemas: ${userData.gems}`);
  } catch (error) {
    console.error(`Erro ao atualizar estatísticas de usuário: ${error.message}`);
  }
}

// função para monitorar atividades de mensagens
async function handleMessageActivity(message) {
  if (message.author.bot) return;

  if (cooldowns.has(message.author.id)) return;
  cooldowns.add(message.author.id);
  setTimeout(() => cooldowns.delete(message.author.id), 60000); // 1 minuto de cooldown

  await updateUserStats(message.author, 10, 5, 1); // Exemplo: 10 XP, 5 moedas, 1 gema
}

// função para monitorar atividades de voz
async function handleVoiceActivity(member, duration) {
  if (member.user.bot || isNaN(duration) || duration <= 0) return;

  if (voiceCooldowns.has(member.user.id)) return; // Bloquear se estiver no cooldown
  voiceCooldowns.add(member.user.id);

  const minutes = Math.floor(duration / 60000);
  const xp = minutes * 2;
  const coins = minutes;

  await updateUserStats(member.user, xp, coins, 0);

  console.log(`XP e Moedas atualizados para ${member.user.username}: ${xp} XP, ${coins} Moedas.`);

  setTimeout(() => voiceCooldowns.delete(member.user.id), 60000); // 1 minuto de cooldown
}


// função para monitorar atividade online
async function handlePresenceUpdate(oldPresence, newPresence) {
  if (!newPresence || !newPresence.member || newPresence.user.bot) return;

  // Verifica se já está no cooldown
  if (cooldownPresence.has(newPresence.user.id)) return;

  // Verifica o status "online"
  if (newPresence.status === PresenceUpdateStatus.Online) {
    await updateUserStats(newPresence.user, 5, 2, 0); // Ganha 5 XP e 2 moedas

    console.log(
      `Presença atualizada para ${newPresence.user.username}: XP +5, Moedas +2`
    );

    // Adiciona ao cooldown
    cooldownPresence.add(newPresence.user.id);
    setTimeout(() => cooldownPresence.delete(newPresence.user.id), 60000); // 1 min de cooldown
    console.log('Cooldown de presença adicionado para ' + newPresence.user.username + ' por 1 minuto.');
  }
}

module.exports = { handleMessageActivity, handleVoiceActivity, handlePresenceUpdate };
