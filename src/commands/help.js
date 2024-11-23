const { EmbedBuilder } = require('discord.js');

async function Help(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Comandos do Bot Jonalandia')
    .setColor('#7289DA')
    .setDescription('Aqui está a lista de comandos disponíveis no bot. Use-os conforme necessário!')
    .addFields(
        { name: '🤖 Comandos Gerais', value: '`/oi` - Responde com Olá!\n`/help` - Exibe esta mensagem de ajuda.\n`/server` - Exibe informações do servidor.\n`/usuario` - Busca informações de um usuário.\n`/clima` - Mostra a previsão do tempo para uma cidade.\n`/birthday` - Registra o dia do seu aniversário.\n`/memes` - Gera um meme aleatório.\n`/conselho` - Dá um conselho aleatório.' },
        { name: '🎟️ Comandos de Sorteios', value: '`/sorteio` - Inscreve um usuário no sorteio.\n `/infosorteio` - Mostra informações sobre o sorteio.\n `/premiosorteio` - Cadastra prêmios para sorteio (Moderador).\n`/limpasorteio` - Limpa os participantes do sorteio (Moderador).\n`/sortear` - Realiza o sorteio e exibe o vencedor (Moderador).' },
        { name: '🛠️ Comandos de Moderação', value: '`/regra` - Mostra as regras do servidor.\n`/clearall` - Deleta mensagens em massa.\n`/clearuser` - Deleta mensagens de um usuário específico.\n`/timeout` - Aplica timeout de 3 minutos em um usuário.\n`/expulsar` - Expulsa um usuário do servidor.\n`/banir` - Bane um usuário do servidor.\n`/desbanir` - Desbane um usuário.\n`/kickuser` - Expulsa um usuário de um canal de voz.\n`/embed` - Cria um embed personalizado.' },
        { name: '🔔 Notificações\n > Só para Moderadores\n', value: '`/cargo` - Mostra botões para gerenciar cargos.\n`/ticket` - Exibe botões para abrir tickets de suporte.\n`/manutencao` - Envia mensagem de manutenção (Moderador).' },
        { name: '🔄 Funcionalidades Automáticas', value: `
            **AntiFloodChat** - Detecta e limita mensagens enviadas rapidamente por usuários.
            **BlockLinks** - Bloqueia links indesejados em chats e status.
            **DetectInappropriateWords** - Detecta e filtra palavras inadequadas.
            **AutoKickNewMembers** - Remove automaticamente membros novos com comportamento suspeito.
            **Birthday Notifications** - Envia notificações para aniversariantes do dia.
            **Notification Check** - Monitora canais do YouTube, Twitch e promoções de jogos gratuitos.
        `}
    )
    .setFooter({ text: 'Jonalandia Bot - Sempre ajudando você!', iconURL: interaction.client.user.displayAvatarURL() });

  await interaction.reply({ embeds: [embed] });
}

module.exports = { Help };
