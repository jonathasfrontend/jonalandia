const { info } = require('./logger');
const { client } = require('./Client');

const { onMemberAdd } = require('./functions/onMemberAdd');
const { ruleMembreAdd } = require('./functions/ruleMembreAdd');
const { onMemberRemove } = require('./functions/onMemberRemove');
const { checkUpdateRoles } = require('./functions/checkUpdateRoles');
const { antiFloodChat } = require('./functions/antiFloodChat');
const { blockLinks } = require('./functions/blockLinks');
const { scheduleBirthdayCheck } = require('./functions/checkBirthdays');
const { Status } = require('./functions/statusBot')
const { scheduleNotificationYoutubeCheck } = require('./functions/onNotificationYoutube');
const { scheduleNotificationTwitchCheck } = require('./functions/onNotificationTwitch');
const { onNotificationFreeGames } = require('./functions/onNotificationFreeGames');

const { Help } = require('./commands/help')
const { searchUser } = require('./commands/searchUser')
const { searchGuild } = require('./commands/searchGuild')
const { menssageFile } = require('./commands/mensage');
const { clearAll } = require('./commands/clearAll')
const { clearUser } = require('./commands/clearMsgUser')
const { mensageRegra } = require('./commands/regra')
const { cargo } = require('./commands/cargo')
const { ticket } = require('./commands/ticket')
const { manutencao } = require('./commands/manutencao')
const { createEmbed } = require('./commands/createEmbed')
const { Birthday } = require('./commands/birthday')

const { bdServerConect } = require('./config/bdServerConect');

require('dotenv').config()

client.once('ready', () => {
  bdServerConect();
  checkUpdateRoles();
  scheduleBirthdayCheck();
  Status();
  scheduleNotificationYoutubeCheck();
  scheduleNotificationTwitchCheck();
  onNotificationFreeGames();

  info.info('O bot Jonalandia está online!');

  client.application?.commands.create({
    name: 'oi',
    description: 'Responde com Olá!',
  })

  client.application?.commands.create({
    name: 'regra',
    description: 'Responde um embed de regras do servidor',
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
    description: 'Deleta um número especificado de mensagens.',
    options: [{
      type: 4, // Alterado de 'INTEGER' para 4
      name: 'number',
      description: 'O número de mensagens a serem deletadas.',
      required: true,
    }],
  });

  client.application?.commands.create({
    name: 'clearuser',
    description: 'Deleta mensagens de um suario especifico.',
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
    description: "Comando para mostrar botões dos cargos!",
  })

  client.application?.commands.create({
    name: 'ticket',
    description: "Comando para mostrar botão para abrir um ticket",
  })

  client.application?.commands.create({
    name: 'manutencao',
    description: "Menssagem de manutenção!",
  })

  client.application?.commands.create({
    name: 'embed',
    description: 'Cria um embed de exemplo no canal',
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
  }
});

client.on('guildMemberAdd', onMemberAdd);
client.on('guildMemberAdd', ruleMembreAdd);
client.on('guildMemberRemove', onMemberRemove);
client.on('messageCreate', blockLinks);
client.on('messageCreate', antiFloodChat);

client.login(process.env.TOKEN);

