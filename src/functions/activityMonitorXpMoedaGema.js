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
      {
        userId: user.id,
        avatarUrl: user.displayAvatarURL({ dynamic: true }),
        username: user.username,
      },
      {
        $inc: {
          xp,
          coins,
          gems,
        },
      },
      {
        new: true,
        upsert: true,
      }
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

async function handleEventParticipation(user, interaction) {
  try {
    if (!interaction.isButton()) return;
    
    if (interaction.customId === 'me_interessa') {
      console.log(`Usuário ${user.username} está participando do evento.`);
      await updateUserStats(user, 50, 20, 5); // Valores arbitrários para eventos 50 XP, 20 moedas, 5 gemas
    }
    console.log('Estatísticas atualizadas com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do evento:', error);
  }
}

// função para monitorar atividade online
async function handlePresenceUpdate(oldPresence, newPresence) {
  if (!newPresence || !newPresence.member || newPresence.user.bot) return;

  // Verifique o status do membro
  const status = newPresence.status;

  if (status === PresenceUpdateStatus.Online) {
    if (cooldownPresence.has(newPresence.user.id)) return;

    await updateUserStats(newPresence.user, 5, 2, 0); // XP e Moedas
    console.log(`XP e moedas adicionados para ${newPresence.user.username}`);

    cooldownPresence.add(newPresence.user.id);
    setTimeout(() => cooldownPresence.delete(newPresence.user.id), 60000);
  }
}

module.exports = { handleMessageActivity, handleVoiceActivity, handlePresenceUpdate, handleEventParticipation };
