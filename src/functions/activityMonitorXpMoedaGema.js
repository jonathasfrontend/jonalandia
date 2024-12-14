const { saveUpdateUserPoints } = require('../utils/saveUpdateUserPoints');

const cooldowns = new Set();
const voiceCooldowns = new Set();

async function handleMessageActivity(message) {
  if (message.author.bot) return;

  if (cooldowns.has(message.author.id)) return;
  cooldowns.add(message.author.id);
  setTimeout(() => cooldowns.delete(message.author.id), 60000); // 1 minuto de cooldown

  await saveUpdateUserPoints(message.author, 10, 5, 1); // Exemplo: 10 XP, 5 moedas, 1 gema
}

async function handleVoiceActivity(member, duration) {
  if (member.user.bot || isNaN(duration) || duration <= 0) return;

  if (voiceCooldowns.has(member.user.id)) return; // Bloquear se estiver no cooldown
  voiceCooldowns.add(member.user.id);

  const minutes = Math.floor(duration / 60000);
  const xp = minutes * 2;
  const coins = minutes;

  await saveUpdateUserPoints(member.user, xp, coins, 0);

  console.log(`XP e Moedas atualizados para ${member.user.username}: ${xp} XP, ${coins} Moedas.`);

  setTimeout(() => voiceCooldowns.delete(member.user.id), 60000); // 1 minuto de cooldown
}

module.exports = { handleMessageActivity, handleVoiceActivity };
