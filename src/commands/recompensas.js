const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { client } = require("../Client");
const { erro, info } = require('../Logger');

async function Recompensas(interaction) {
    const { user } = interaction;
    const userId = user.id;

    try {
        let userData = await User.findOne({ userId });

        if (!userData) {
            userData = new User({
                userId,
                username: user.username,
                coins: 0,
                dailyRewardTimestamp: null,
            });
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
        const nextMidnight = new Date(today.getTime() + 24 * 60 * 60 * 1000); 
        const lastClaim = userData.dailyRewardTimestamp;

        if (lastClaim && lastClaim >= today) {
            const nextClaimTime = nextMidnight.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
            return interaction.reply({
                content: `Você já resgatou recompensas diárias hoje! Aguarde até ${nextMidnight.toLocaleDateString('pt-BR')} às ${nextClaimTime} para resgatar novamente.`,
                ephemeral: true
            });
        }

        const reward = Math.floor(Math.random() * (3500 - 1800 + 1)) + 1800;

        userData.coins += reward;
        userData.dailyRewardTimestamp = now;
        await userData.save();

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🎉 Recompensa Diária Resgatada!')
            .setDescription(`Você recebeu ${reward.toLocaleString('pt-BR')} moedas como recompensa diária!`)
            .addFields(
                { name: '💰 Seu saldo atual', value: `${userData.coins.toLocaleString('pt-BR')} moedas`, inline: true },
            )
            .setFooter({ text: 'Volte amanhã para resgatar novamente!', iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed] });

        info.info(`Recompensa diária de ${reward} moedas resgatada por ${user.tag}.`);

    } catch (error) {
        erro.error('Erro ao executar o comando de recompensas', error);
        await interaction.reply({ content: 'Ocorreu um erro ao resgatar sua recompensa diária. Por favor, tente novamente mais tarde.', ephemeral: true });
    }
}

module.exports = { Recompensas };