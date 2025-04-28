const { saveUpdateUserPoints } = require('../utils/saveUpdateUserPoints');
const { info, erro } = require('../logger');

const cooldowns = new Set();
const voiceCooldowns = new Set();

async function handleMessageActivity(message) {
  if (message.author.bot) return;

  if (cooldowns.has(message.author.id)) return;
  cooldowns.add(message.author.id);
  setTimeout(() => cooldowns.delete(message.author.id), 60000); // 1 minuto de cooldown

  await saveUpdateUserPoints(message.author, 100, 120, 4); // Exemplo: 100 XP, 120 moedas, 4 gema
}

async function handleVoiceActivity(member, duration) {
  if (member.user.bot || isNaN(duration) || duration <= 0) return;

  if (voiceCooldowns.has(member.user.id)) return; // Bloquear se estiver no cooldown
  voiceCooldowns.add(member.user.id);

  const minutes = Math.floor(duration / 60000);
  const xp = minutes * 20; // Exemplo: 60 minutos = 1200 XP
  const coins = minutes * 30;  // Exemplo: 60 minutos = 1800 moedas

  await saveUpdateUserPoints(member.user, xp, coins, 2); 

  info.info(`XP e Moedas atualizados para ${member.user.username}: ${xp} XP, ${coins} Moedas.`);

  setTimeout(() => voiceCooldowns.delete(member.user.id), 60000); // 1 minuto de cooldown
}

module.exports = { handleMessageActivity, handleVoiceActivity };
