const { info } = require('./logger');
const { client } = require('./Client');

const { antiFloodChat } = require('./functions/punicfunction/antiFloodChat');
const { blockLinks } = require('./functions/punicfunction/blockLinks');
const { detectInappropriateWords } = require('./functions/punicfunction/detectInappropriateWords');
const { autoKickNewMembers } = require('./functions/punicfunction/kickNewMembers');
const { blockFileTypes } = require('./functions/punicfunction/blockFileTypes');

const { onMemberAdd } = require('./functions/onMemberAdd');
const { ruleMembreAdd } = require('./functions/ruleMembreAdd');
const { onMemberRemove } = require('./functions/onMemberRemove');
const { checkUpdateRoles } = require('./functions/checkUpdateRoles');
const { scheduleBirthdayCheck } = require('./functions/checkBirthdays');
const { Status } = require('./functions/statusBot');
const { scheduleNotificationYoutubeCheck } = require('./functions/onNotificationYoutube');
const { scheduleNotificationTwitchCheck } = require('./functions/onNotificationTwitch');
const { scheduleonNotificationFreeGamesCheck } = require('./functions/onNotificationFreeGames');

const { searchUser } = require('./commands/searchUser');
const { searchGuild } = require('./commands/searchGuild');
const { menssageFile } = require('./commands/mensage');
const { mensageRegra } = require('./commands/regra');
const { Birthday } = require('./commands/birthday');
const { generatorMemes } = require('./commands/generatorMemes');
const { generatorConselho } = require('./commands/generatorConselho');
const { getWeather } = require('./commands/weather');

const { Help } = require('./commands/moderador/help');
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


const { bdServerConect } = require('./config/bdServerConect');

require('dotenv').config()

client.once('ready', () => {
  bdServerConect();
  checkUpdateRoles();
  scheduleBirthdayCheck();
  Status();
  scheduleNotificationYoutubeCheck();
  scheduleNotificationTwitchCheck();
  scheduleonNotificationFreeGamesCheck();

  info.info('O bot Jonalandia está online!');

  client.application?.commands.create({
    name: 'oi',
    description: 'Responde com Olá!',
  })

  client.application?.commands.create({
    name: 'regra',
    description: 'Responde um embed de regras do servidor (Moderador)',
  })

  client.application?.commands.create({
    name: 'usuario',
    description: 'Busca informações do usuario',
    options: [{
      type: 3, // Tipo 3 representa uma string
      name: 'usuario',
      description: 'Coloque o nome do usuario.',
      required: true,
    }],
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
    name: 'memes',
    description: 'Gera um meme aleatório'
  });

  client.application?.commands.create({
    name: 'conselho',
    description: 'Receba um conselho aleatório.',
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
  } else if (commandName === 'usuario') {
    await searchUser(interaction);
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
  } else if (commandName === 'memes') {
    await generatorMemes(interaction);
  } else if (commandName === 'conselho') {
    await generatorConselho(interaction);
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
}
});

client.on('guildMemberAdd', onMemberAdd);
client.on('guildMemberAdd', ruleMembreAdd);
client.on('guildMemberRemove', onMemberRemove);

client.on('guildMemberAdd', autoKickNewMembers);
client.on('messageCreate', blockLinks);
client.on('messageCreate', antiFloodChat);
client.on('messageCreate', detectInappropriateWords);
client.on('messageCreate', blockFileTypes);

client.login(process.env.TOKEN);