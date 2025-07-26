const { EmbedBuilder } = require('discord.js');
const ChannelModel = require('../../models/onAddChannelSchema');
const { client } = require('../../Client');
const { logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function addChannels(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    if (!interaction.isCommand() || interaction.commandName !== 'addchannels') return;

    const subCommand = options.getString('opcao');
    const specificChannel = options.getChannel('canal');

    try {
        if (commandName === 'addchannels') {

            await interaction.deferReply({ ephemeral: true });

            if (subCommand === 'todos') {
                const textChannels = guild.channels.cache.filter(channel => channel.type === 0); // Apenas canais de texto
                const channelsToAdd = textChannels.map(channel => ({
                    channelId: channel.id,
                    guildId: guild.id,
                    channelName: channel.name,
                    channelType: channel.type,
                    guildName: channel.guild.name,
                }));

                await ChannelModel.insertMany(channelsToAdd, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err; // Ignora duplicados
                });

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Canais Adicionados')
                    .setDescription(`Foram adicionados ${textChannels.size} canais de texto ao banco de dados.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });


                const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                await logChannel.send(`Foram adicionados ${textChannels.size} canais de texto ao banco de dados.`);
    
                logger.info(`Foram adicionados ${textChannels.size} canais de texto ao banco de dados.`);

            } else if (subCommand === 'um') {
                if (!specificChannel || specificChannel.type !== 0) {
                    await interaction.editReply('Por favor, selecione um canal de texto válido.');
                    logger.warn(`Tentativa de registrar canal inválido: ${specificChannel ? specificChannel.id : 'Nenhum canal selecionado'}`);
                    return;
                }

                const channelData = {
                    channelId: specificChannel.id,
                    guildId: guild.id,
                    channelName: specificChannel.name,
                    channelType: specificChannel.type,
                    guildName: guild.name,
                };

                await ChannelModel.create(channelData).catch(err => {
                    if (err.code === 11000) {
                        interaction.editReply("Este canal já está registrado.");
                        logger.warn(`Tentativa de registrar canal já existente: ${specificChannel.id}`);
                        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                        logChannel.send(`Este canal já está registrado.`);
                        
                    }
                    return;
                });

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Canal Adicionado')
                    .setDescription(`O canal <#${specificChannel.id}> foi adicionado ao banco de dados.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                
                const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                await logChannel.send(`O canal <#${specificChannel.id}> foi adicionado ao banco de dados.`);

                logger.info(`O canal <#${specificChannel.id}> foi adicionado ao banco de dados.`);
            }
            
        }

    } catch (error) {
        logger.error('Erro ao registrar canais', error);
        
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao registrar canais.`);
    }
}

module.exports = { addChannels };
