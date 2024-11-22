const { erro, info } = require('../logger');
const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const Sorteio = require('../models/sorteioSchema');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function sorteioUser(interaction) {
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
        if (commandName === 'sorteio') {
            const usuarioId = interaction.options.getUser('usuario').id;
            const nomeUsuario = interaction.options.getUser('usuario').username;

            const usuarioExistente = await Sorteio.findOne({ usuarioId });

            if (usuarioExistente) {
                const embedJaCadastrado = new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`${nomeUsuario} já está cadastrado no sorteio!`)
                    .setDescription('Você já está participando do sorteio.')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.reply({ embeds: [embedJaCadastrado], ephemeral: true });
            } else {
                const novoSorteio = new Sorteio({
                    usuarioId,
                    nomeUsuario,
                });

                await novoSorteio.save();

                const embedCadastrado = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`${nomeUsuario} foi cadastrado no sorteio!`)
                    .setDescription('Agora este usuário está participando do sorteio.')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.reply({ embeds: [embedCadastrado], ephemeral: true });

                const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                await logChannel.send(`Usuário ${nomeUsuario} cadastrado no sorteio.`);
                info.info(`Usuário ${nomeUsuario} cadastrado no sorteio.`);
            }
        }
    } catch (error) {
        erro.error('Erro ao processar o comando de sorteio', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao processar o comando de sorteio: ${error.message}`);
    }
}

module.exports = { sorteioUser };
