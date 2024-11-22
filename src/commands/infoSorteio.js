const { erro, info } = require('../logger');
const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const Sorteio = require('../models/sorteioSchema')
const Premio = require('../models/premioSorteioSchema')
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function infoSorteio(interaction) {
    const { commandName, channelId } = interaction;

    if (!interaction.isCommand()) return;

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    
    try {
        if (commandName === 'infosorteio') {
            const participantes = await Sorteio.find({});
            const premio = await  Premio.findOne({});

            if (!participantes.length) {
                return interaction.reply({
                    content: 'Nenhum participante encontrado no sorteio.',
                    ephemeral: true,
                });
            }

            if (!premio) {
                return interaction.reply({
                    content: 'Nenhuma informação de prêmio encontrada.',
                    ephemeral: true,
                });
            }

            // Criação do embed
            const embed = new EmbedBuilder()
                .setTitle('🎉 Informações do Sorteio 🎉')
                .setColor('#FFD700')
                .addFields(
                    {
                        name: '🎁 Prêmio',
                        value: `${premio.premio || 'Prêmio não especificado'}`,
                        inline: true,
                    },
                    {
                        name: '👑 Organizador',
                        value: `${premio.dono || 'Desconhecido'}`,
                        inline: true,
                    },
                    {
                        name: '👥 Participantes',
                        value: participantes.map((p) => `- ${p.nomeUsuario}`).join('\n'),
                    }
                )
                .setFooter({ text: 'Boa sorte a todos!', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Informações do sorteio enviadas com sucesso.`);
            info.info(`Informações do sorteio enviadas com sucesso.`);
        }
    } catch (error) {
        erro.error('Erro ao pesquisar as informações do sorteio', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao pesquisar as informações do sorteio ${error.message}`);
    }
}

module.exports = { infoSorteio };
