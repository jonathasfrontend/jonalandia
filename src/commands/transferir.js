const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { erro, info } = require('../Logger');

async function tranferirMoeda(interaction) {
    const { options, user: sender } = interaction;

    const recipient = options.getUser('usuario');
    const amount = options.getInteger('quantidade');

    if (recipient.id === sender.id) {
        return interaction.reply({ content: 'Você não pode transferir moedas para si mesmo.', ephemeral: true });
    }

    if (amount <= 0) {
        return interaction.reply({ content: 'Por favor, insira um valor válido maior que 0.', ephemeral: true });
    }

    try {
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

        info.info(`Transferência de ${amount} moedas de ${sender.tag} para ${recipient.tag}.`);
    } catch (error) {
        erro.error('Erro ao executar o comando de transferência', error);
        await interaction.reply({ content: 'Ocorreu um erro ao processar sua transferência. Tente novamente mais tarde.', ephemeral: true });
    }
}

module.exports = { tranferirMoeda };
