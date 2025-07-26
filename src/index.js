/*
  * PROJETO: Bot Jonalandia
  * AUTOR: Jonathas Oliveira
  * LICENÇA: JPL (Jonathas Proprietary License)
  * Veja mais em: LICENSE
*/

require('dotenv').config();

const { logger, botEvent } = require('./logger');
const { client } = require('./Client');

const { antiFloodChat } = require('./functions/punicfunction/antiFloodChat');
const { blockLinks } = require('./functions/punicfunction/blockLinks');
const { detectInappropriateWords } = require('./functions/punicfunction/detectInappropriateWords');
const { autoKickNewMembers } = require('./functions/punicfunction/kickNewMembers');
const { blockFileTypes } = require('./functions/punicfunction/blockFileTypes');

const { onMemberAdd } = require('./functions/onMemberAdd');
const { ruleMembreAdd } = require('./functions/ruleMembreAdd');
const { onMemberRemove } = require('./functions/onMemberRemove');
const { Status } = require('./functions/statusBot');
const { checkUpdateRoles } = require('./functions/checkUpdateRoles');
const { scheduleBirthdayCheck } = require('./functions/checkBirthdays');
const { scheduleNotificationYoutubeCheck } = require('./functions/onNotificationYoutube');
const { scheduleNotificationTwitchCheck } = require('./functions/onNotificationTwitch');
const { scheduleonNotificationFreeGamesCheck } = require('./functions/onNotificationFreeGames');

const { Help } = require('./commands/help');
const { searchGuild } = require('./commands/searchGuild');
const { menssageFile } = require('./commands/mensage');
const { Birthday } = require('./commands/birthday');
const { getWeather } = require('./commands/weather');
const { sorteioUser } = require('./commands/sorteio')
const { infoSorteio } = require('./commands/infoSorteio')

const { mensageRegra } = require('./commands/moderador/regra');
const { createEmbed } = require('./commands/moderador/createEmbed');
const { clearAll } = require('./commands/moderador/clearAll');
const { clearUser } = require('./commands/moderador/clearMsgUser');
const { cargo } = require('./commands/moderador/cargo');
const { ticket } = require('./commands/moderador/ticket');
const { manutencao } = require('./commands/moderador/manutencao');
const { timeout } = require('./commands/moderador/timeout');
const { expulsar } = require('./commands/moderador/expulsar');
const { banUser } = require('./commands/moderador/banUser');
const { unbanUser } = require('./commands/moderador/unbanUser');
const { kickUser } = require('./commands/moderador/kickUser');
const { perfilInfoUser } = require('./commands/moderador/searchUser');
const { premioSorteio } = require('./commands/moderador/premiosorteio')
const { limpaSorteio } = require('./commands/moderador/limpasorteio')
const { sortear } = require('./commands/moderador/sortear')
const { voteParaBan } = require('./commands/moderador/voteparaban')
const { excluirComando } = require('./commands/moderador/deleteCommand');

const { registerStreamersTwitch } = require('./commands/initializebot/registerStreamersTwitch');
const { registerChannelsYoutube } = require('./commands/initializebot/registerChannelsYoutube');
const { addChannels } = require('./commands/initializebot/addChannels');
const { removeChannels } = require('./commands/initializebot/removeChannels');

const { bdServerConect } = require('./config/bdServerConect');

client.once('ready', () => {
  try {
    logger.info('Inicializando bot Jonalandia...', { module: 'BOT' });

    bdServerConect();

    Status();
    botEvent('STATUS_SET', 'Status do bot configurado');

    checkUpdateRoles();
    botEvent('ROLE_CHECKER_STARTED', 'Sistema de verificação de cargos iniciado');

    scheduleBirthdayCheck();
    botEvent('BIRTHDAY_SCHEDULER_STARTED', 'Agendador de aniversários iniciado');

    scheduleNotificationYoutubeCheck();
    botEvent('YOUTUBE_NOTIFICATION_STARTED', 'Monitoramento de YouTube iniciado');

    scheduleNotificationTwitchCheck();
    botEvent('TWITCH_NOTIFICATION_STARTED', 'Monitoramento de Twitch iniciado');

    scheduleonNotificationFreeGamesCheck();
    botEvent('FREE_GAMES_NOTIFICATION_STARTED', 'Monitoramento de jogos gratuitos iniciado');

    logger.info('Bot Jonalandia está online e todos os sistemas foram inicializados!', { module: 'BOT' });
  } catch (error) {
    logger.error('Erro durante inicialização do bot', { module: 'BOT' }, error);
  }

  client.application?.commands.create({
    name: 'oi',
    description: 'Responde com Olá!',
  })

  client.application?.commands.create({
    name: 'regra',
    description: 'Responde um embed de regras do servidor (Moderador)',
  })

  client.application?.commands.create({
    name: 'clearall',
    description: 'Deleta um número especificado de mensagens. (Moderador)',
    options: [{
      type: 4, // Alterado de 'INTEGER' para 4
      name: 'number',
      description: 'O número de mensagens a serem deletadas.',
      required: true,
    }],
  });

  client.application?.commands.create({
    name: 'clearuser',
    description: 'Deleta mensagens de um suario especifico. (Moderador)',
    options: [
      {
        type: 4, // Inteiro para número de mensagens
        name: 'numero',
        description: 'O número de mensagens a serem deletadas.',
        required: true,
      },
      {
        type: 6, // Tipo 6 é para usuário (Discord user)
        name: 'usuario',
        description: 'O usuário cujas mensagens serão deletadas.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'server',
    description: "Busca informações do servidor!",
  })

  client.application?.commands.create({
    name: 'help',
    description: "Ajuda com os comandos!",
  })

  client.application?.commands.create({
    name: 'cargo',
    description: "Comando para mostrar botões dos cargos! (Moderador)",
  })

  client.application?.commands.create({
    name: 'ticket',
    description: "Comando para mostrar botão para abrir um ticket",
  })

  client.application?.commands.create({
    name: 'manutencao',
    description: "Menssagem de manutenção! (Moderador)",
  })

  client.application?.commands.create({
    name: 'embed',
    description: 'Cria um embed de exemplo no canal (Moderador)',
    options: [
      {
        type: 3, // Tipo de string
        name: 'titulo',
        description: 'O título do embed',
        required: true
      },
      {
        type: 3, // Tipo de string
        name: 'descricao',
        description: 'A descrição do embed',
        required: true
      },
      {
        type: 7, // Tipo de canal
        name: 'canal',
        description: 'O canal onde o embed será enviado',
        required: true
      },
      {
        type: 3,
        name: 'cor',
        description: 'A cor do embed a ser enviado',
        required: true
      }
    ],
  });

  client.application?.commands.create({
    name: 'birthday',
    description: 'Registra o dia do seu aniversário ',
    options: [
      {
        type: 4, // Tipo de string
        name: 'dia',
        description: 'O dia do seu aniversário',
        required: true
      },
      {
        type: 4, // Tipo de string
        name: 'mes',
        description: 'O mês do seu aniversário',
        required: true
      }
    ],
  });

  client.application?.commands.create({
    name: 'timeout',
    description: 'Aplica um timeout de 3 minutos em um usuário. (Moderador)',
    options: [
      {
        type: 6,
        name: 'usuario',
        description: 'Selecione o usuário para aplicar o timeout.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'expulsar',
    description: 'Expulsa um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo 6 é para selecionar usuário
        name: 'usuario',
        description: 'O usuário a ser expulso',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'banir',
    description: 'Bane um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo para usuário (Discord user)
        name: 'usuario',
        description: 'O usuário que será banido.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'desbanir',
    description: 'Desbane um usuário do servidor (Moderador)',
    options: [
      {
        type: 6, // Tipo 6 representa um usuário
        name: 'usuario',
        description: 'Selecione o usuário a ser desbanido',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'kickuser',
    description: 'Expulsa um usuário do canal de voz. (Moderador)',
    options: [
      {
        type: 6, // Tipo para usuário (Discord user)
        name: 'usuario',
        description: 'O usuário a ser expulso do canal de voz.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'clima',
    description: 'Exibe a previsão do tempo para uma cidade especificada',
    options: [{
      type: 3, // Tipo de string
      name: 'cidade',
      description: 'Nome da cidade para buscar o clima',
      required: true,
    }],
  });

  client.application?.commands.create({
    name: 'infouser',
    description: 'Busca informações de um usuário pela API',
    options: [
      {
        type: 6, // Tipo string
        name: 'usuario',
        description: 'Nome do usuário a ser buscado.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'sorteio',
    description: 'Cadastrar para participar do sorteio',
    options: [
      {
        type: 6,
        name: 'usuario',
        description: 'Usuário a ser registrado no sorteio.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'premiosorteio',
    description: 'Cadastro de prêmio para sorteio (Moderador)',
    options: [
      {
        type: 3,
        name: 'premio',
        description: 'O prêmio.',
        required: true,
      },
    ],
  });

  client.application?.commands.create({
    name: 'limpasorteio',
    description: 'Limpa todos os participantes do sorteio (Moderador)',
  });

  client.application?.commands.create({
    name: 'sortear',
    description: 'Realiza o sorteio e exibe o vencedor',
  });

  client.application?.commands.create({
    name: 'infosorteio',
    description: 'Lista os participantes e informações do sorteio',
  });

  client.application?.commands.create({
    name: 'voteparaban',
    description: 'Inicia uma votação para banir um usuário.',
    options: [
      {
        type: 6,
        name: 'usuario',
        description: 'Selecione o usuário para iniciar a votação de ban.',
        required: true,
      },
    ],
  });


  client.application?.commands.create({
    name: 'excluicomando',
    description: 'Exclui um comando do bot. (Moderador)',
    options: [
      {
        type: 3, // Tipo de string
        name: 'comando',
        description: 'O nome do comando a ser excluído.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'registerstreamerstwitch',
    description: 'Cadastra um novo streamer para ser notificado. (Moderador, Inicialização do Bot)',
    options: [
      {
        type: 3, // Tipo de string
        name: 'streamer',
        description: 'O nome do streamer.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'registerchannelsyoutube',
    description: 'Cadastra um novo canal do youtube para ser notificado. (Moderador, Inicialização do Bot)',
    options: [
      {
        type: 3, // Tipo de string
        name: 'channel',
        description: 'O nome do canal.',
        required: true,
      }
    ],
  });

  client.application?.commands.create({
    name: 'addchannels',
    description: 'Adiciona canais ao banco de dados.',
    options: [
        {
            type: 3, // Tipo string
            name: 'opcao',
            description: 'Escolha entre "todos" ou "um" (Moderador, Inicialização do Bot)',
            required: true,
            choices: [
                { name: 'Todos os canais de texto', value: 'todos' },
                { name: 'Adicionar um canal específico', value: 'um' }
            ]
        },
        {
            type: 7, // Tipo canal
            name: 'canal',
            description: 'Selecione o canal (opcional para a opção "um")',
            required: false
        }
    ]
  });

  client.application?.commands.create({
    name: 'removechannels',
    description: 'Remove um canal de texto do banco de dados. (Moderador, Inicialização do Bot)',
    options: [
      {
        type: 7, // Tipo 7 é para selecionar um canal
        name: 'channel',
        description: 'Selecione o canal de texto a ser removido.',
        required: true,
      },
    ],
  });

});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'clearall') {
    await clearAll(interaction);
  } else if (commandName === 'oi') {
    await menssageFile(interaction);
  } else if (commandName === 'regra') {
    await mensageRegra(interaction);
  } else if (commandName === 'help') {
    await Help(interaction);
  } else if (commandName === 'server') {
    await searchGuild(interaction)
  } else if (commandName === 'cargo') {
    await cargo(interaction)
  } else if (commandName === 'ticket') {
    await ticket(interaction)
  } else if (commandName === 'manutencao') {
    await manutencao(interaction)
  } else if (commandName === 'clearuser') {
    await clearUser(interaction)
  } else if (commandName === 'embed') {
    await createEmbed(interaction);
  } else if (commandName === 'birthday') {
    await Birthday(interaction);
  } else if (commandName === 'timeout') {
    await timeout(interaction);
  } else if (commandName === 'expulsar') {
    await expulsar(interaction);
  } else if (commandName === 'banir') {
    await banUser(interaction);
  } else if (commandName === 'desbanir') {
    await unbanUser(interaction);
  } else if (commandName === 'kickuser') {
    await kickUser(interaction);
  } else if (commandName === 'clima') {
    await getWeather(interaction);
  } else if (commandName === 'infouser') {
    await perfilInfoUser(interaction);
  } else if (commandName === 'sorteio') {
    await sorteioUser(interaction);
  } else if (commandName === 'premiosorteio') {
    await premioSorteio(interaction);
  } else if (commandName === 'limpasorteio') {
    await limpaSorteio(interaction);
  } else if (commandName === 'sortear') {
    await sortear(interaction);
  } else if (commandName === 'infosorteio') {
    await infoSorteio(interaction);
  } else if (commandName === 'voteparaban') {
    await voteParaBan(interaction);
  } else if (commandName === 'excluicomando') {
    await excluirComando(interaction);
  } else if (commandName === 'registerstreamerstwitch') {
    await registerStreamersTwitch(interaction);
  } else if (commandName === 'registerchannelsyoutube') {
    await registerChannelsYoutube(interaction);
  } else if (commandName === 'addchannels') {
    await addChannels(interaction);
  } else if (commandName === 'removechannels') {
    await removeChannels(interaction);
  }
});

client.on('guildMemberAdd', onMemberAdd);
client.on('guildMemberAdd', ruleMembreAdd);
client.on('guildMemberAdd', autoKickNewMembers);

client.on('guildMemberRemove', onMemberRemove);

client.on('messageCreate', blockLinks);
client.on('messageCreate', antiFloodChat);
client.on('messageCreate', detectInappropriateWords);
client.on('messageCreate', blockFileTypes);

client.login(process.env.TOKEN);