const { EmbedBuilder } = require('discord.js');
const { logger, commandExecuted } = require('../logger');

async function Help(interaction) {
  try {
    const context = {
      module: 'COMMAND',
      command: 'help',
      user: interaction.user.tag,
      guild: interaction.guild?.name
    };

    logger.debug('Iniciando comando help', context);

    const embed = new EmbedBuilder()
      .setTitle('📋 Comandos do Bot Jonalandia')
      .setColor('#7289DA')
      .setDescription('Aqui está a lista de comandos disponíveis no bot. Use-os conforme necessário!')
      .addFields(
          { name: '🤖 Comandos Gerais', value: '`/oi` - Responde com Olá!\n`/help` - Exibe esta mensagem de ajuda\n`/server` - Exibe informações do servidor\n`/clima` - Mostra a previsão do tempo para uma cidade\n`/aniversario` - Registra o dia do seu aniversário' },
          { name: '🎟️ Comandos de Sorteios', value: '`/sorteio` - Cadastra usuário para participar do sorteio\n`/infosorteio` - Lista participantes e informações do sorteio\n`/premiosorteio` - Cadastra prêmio para sorteio (Moderador)\n`/limpasorteio` - Limpa todos os participantes do sorteio (Moderador)\n`/sortear` - Realiza o sorteio e exibe o vencedor (Moderador)' },
          { name: '🛠️ Comandos de Moderação', value: '`/regra` - Responde embed de regras do servidor (Moderador)\n`/clean` - Limpa mensagens do canal ou de usuário específico (Moderador)\n`/timeout` - Aplica timeout de 3 minutos em um usuário (Moderador)\n`/expulsar` - Expulsa um usuário do servidor (Moderador)\n`/banir` - Bane um usuário do servidor (Moderador)\n`/desbanir` - Desbane um usuário do servidor (Moderador)\n`/kickuser` - Expulsa um usuário do canal de voz (Moderador)\n`/embed` - Cria um embed personalizado (Moderador)\n`/ficha` - Busca dados do usuário no servidor (Moderador)\n`/voteparaban` - Inicia votação para banir um usuário\n`/excluicomando` - Exclui um comando do bot (Moderador)' },
          { name: '🎮 Comandos de Interface', value: '`/cargo` - Mostra botões dos cargos (Moderador)\n`/ticket` - Mostra botão para abrir ticket\n`/manutencao` - Mensagem de manutenção (Moderador)' },
          { name: '⚙️ Comandos de Inicialização do Bot', value: '`/addtwitch` - Cadastra streamer para notificação (Moderador)\n`/addyoutube` - Cadastra canal do YouTube para notificação (Moderador)\n`/addchannels` - Adiciona canais ao banco de dados (Moderador)\n`/removechannels` - Remove canal do banco de dados (Moderador)' },
          { name: '🔄 Funcionalidades Automáticas', value: `
              **AntiFloodChat** - Detecta e limita mensagens enviadas rapidamente
              **BlockLinks** - Bloqueia links indesejados em chats
              **DetectInappropriateWords** - Detecta e filtra palavras inadequadas
              **AutoKickNewMembers** - Remove membros novos com comportamento suspeito
              **Birthday Notifications** - Notificações para aniversariantes do dia
              **YouTube/Twitch Monitor** - Monitora canais e streamers cadastrados
              **Free Games Monitor** - Monitora promoções de jogos gratuitos
          `}
      )
      .setFooter({ text: 'Jonalandia Bot - Sempre ajudando você!', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
    
    commandExecuted('help', interaction.user, interaction.guild, true);
    logger.info('Lista de comandos exibida com sucesso', context);

  } catch (error) {
    const context = {
      module: 'COMMAND',
      command: 'help',
      user: interaction.user.tag,
      guild: interaction.guild?.name
    };

    logger.error('Erro ao executar comando help', context, error);
    commandExecuted('help', interaction.user, interaction.guild, false);

    if (!interaction.replied) {
      await interaction.reply({ content: 'Ocorreu um erro ao exibir a lista de comandos.', ephemeral: true });
    }
  }
}

module.exports = { Help };
