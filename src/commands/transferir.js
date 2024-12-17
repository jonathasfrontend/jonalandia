const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { client } = require("../Client");
const { erro, info } = require('../Logger');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function tranferirMoeda(interaction) {
    const { options, user: sender, channelId, commandName } = interaction;

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
        if (commandName === 'transferir') {
            const recipient = options.getUser('usuario');
            const amount = options.getInteger('quantidade');

            if (recipient.id === sender.id) {
                return interaction.reply({ content: 'Você não pode transferir moedas para si mesmo.', ephemeral: true });
            }
            if (amount <= 0) {
                return interaction.reply({ content: 'Por favor, insira um valor válido maior que 0.', ephemeral: true });
            }
            const senderData = await User.findOne({ username: sender.username });
            const recipientData = await User.findOne({ username: recipient.username });

            if (!senderData) {
                return interaction.reply({
                    content: 'Você ainda não possui um perfil registrado.',
                    ephemeral: true
                });
            }

            if (!recipientData) {
                return interaction.reply({
                    content: 'O destinatário ainda não possui um perfil registrado.',
                    ephemeral: true
                });
            }

            if (senderData.coins < amount) {
                return interaction.reply({
                    content: `Você não tem moedas suficientes para realizar essa transferência. Seu saldo atual é ${senderData.coins} moedas.`,
                    ephemeral: true
                });
            }

            senderData.coins -= amount;
            recipientData.coins += amount;

            await senderData.save();
            await recipientData.save();

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Transferência Concluída')
                .setDescription(`Você transferiu ${amount} moedas para ${recipient.tag}.`)
                .addFields(
                    { name: 'Seu novo saldo', value: `${senderData.coins} moedas`, inline: true },
                    { name: 'Saldo do destinatário', value: `${recipientData.coins} moedas`, inline: true }
                )
                .setFooter({ text: 'Obrigado por usar o sistema de transferência!' });

            await interaction.reply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Transferência de ${amount} moedas de ${sender.tag} para ${recipient.tag}.`);
            info.info(`Transferência de ${amount} moedas de ${sender.tag} para ${recipient.tag}.`);

        }
    } catch (error) {
        erro.error(`Erro na tranferencia de Jonacoins para ${amount} de ${sender.tag} para ${recipient.tag}.`, error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro na tranferencia de Jonacoins de ${sender.tag} para ${recipient.tag}. ${error.message}`);
    }
}

module.exports = { tranferirMoeda };
