require('./config/bdServerConect');
require('./functions/onNotificationTwitch');
// require('./functions/onNotificationYoutube');

const logger = require('./logger');
const { client } = require('./Client');

const { onMemberAdd } = require('./functions/onMemberAdd');
const { ruleMembreAdd } = require('./functions/ruleMembreAdd');
const { onMemberRemove } = require('./functions/onMemberRemove');
const { checkUpdateRoles } = require('./functions/checkUpdateRoles');

const { Help } = require('./commands/help')
const { searchUser } = require('./commands/searchUser')
const { searchGuild } = require('./commands/searchGuild')
const { menssageFile } = require('./commands/mensage');
const { clearCommand } = require('./commands/clear')
const { mensageRegra } = require('./commands/regra')
const { cargo } = require('./commands/cargo')
const { ticket } = require('./commands/ticket')
const { manutencao } = require('./commands/manutencao')

const { Play } = require('./commands/musica/play')
const { Pause } = require('./commands/musica/pause')
const { Resume } = require('./commands/musica/resume')
const { Kickbot } = require('./commands/musica/kickBot')
const { Skip } = require('./commands/musica/skip')

const { Player } = require('discord-player');

require('dotenv').config()

client.once('ready', () => {
  logger.info('O bot Jonalandia está online!');
  require('./functions/statusBot')  

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
    name: 'play',
    description: 'Tocar musica',
    options: [{
      type: 3, // Tipo 3 representa uma string
      name: 'url',
      description: 'Link da musica.',
      required: true,
    }],
  })
  
  client.application?.commands.create({
    name: 'pause',
    description: 'Pausa a musica',
  })

  client.application?.commands.create({
    name: 'resume',
    description: 'Da play na musica pausada',
  })

  client.application?.commands.create({
    name: 'kick',
    description: 'Remove o bot da call',
  })

  client.application?.commands.create({
    name: 'skip',
    description: 'Pula para a proxima musica',
  })

  client.application?.commands.create({
    name: 'clear',
    description: 'Deleta um número especificado de mensagens.',
    options: [{
      type: 4, // Alterado de 'INTEGER' para 4
      name: 'number',
      description: 'O número de mensagens a serem deletadas.',
      required: true,
    }],
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

  checkUpdateRoles()
});

client.config = require('./config/configPlayerMusic');
const player = new Player(client, client.config.opt.discordPlayer);
player.extractors.loadDefault();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'pause') {
    await Pause(interaction);
  } else if (commandName === 'resume') {
    await Resume(interaction);
  } else if (commandName === 'kick') {
    await Kickbot(interaction);
  } else if (commandName === 'clear') {
    await clearCommand(interaction);
  } else if (commandName === 'oi') {
    await menssageFile(interaction);
  } else if (commandName === 'regra') {
    await mensageRegra(interaction);
  } else if (commandName === 'usuario') {
    await searchUser(interaction);
  } else if (commandName === 'play') {
    await Play(interaction);
  } else if (commandName === 'help') {
    await Help(interaction);
  } else if (commandName === 'server') {
    await searchGuild(interaction)
  } else if (commandName === 'skip') {
    await Skip(interaction)
  } else if (commandName === 'cargo') {
    await cargo(interaction)
  }else if (commandName === 'ticket') {
    await ticket(interaction)
  }else if (commandName === 'manutencao') {
    await manutencao(interaction)
  }
});

client.on('guildMemberAdd', onMemberAdd);
client.on('guildMemberAdd', ruleMembreAdd);
client.on('guildMemberRemove', onMemberRemove);

client.login(process.env.TOKEN);

