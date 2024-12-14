const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { client } = require("../Client");
const { erro, info } = require('../Logger');

async function Recompensas(interaction) {
    const { user } = interaction; // Usuário que executou o comando
    const userId = user.id;

    try {
        // Busca o perfil do usuário no banco de dados
        let userData = await User.findOne({ userId });

        // Caso o perfil do usuário não exista, cria um novo
        if (!userData) {
            userData = new User({
                userId,
                username: user.username,
                coins: 0,
                dailyRewardTimestamp: null // Armazena o último resgate
            });
        }

        const now = new Date();
        const lastClaim = userData.dailyRewardTimestamp;

        // Verifica se o usuário já resgatou hoje
        if (lastClaim && now - lastClaim < 24 * 60 * 60 * 1000) {
            const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
            const nextClaimTime = nextClaim.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
            return interaction.reply({
                content: `Você já resgatou recompensas diárias hoje! Aguarde até ${nextClaim.toLocaleDateString('pt-BR')} às ${nextClaimTime} para resgatar novamente.`,
                ephemeral: true
            });
        }

        // Gera uma recompensa aleatória entre 1800 e 3500 moedas
        const reward = Math.floor(Math.random() * (3500 - 1800 + 1)) + 1800;

        // Atualiza o saldo e a data de resgate no banco de dados
        userData.coins += reward;
        userData.dailyRewardTimestamp = now;
        await userData.save();

        // Cria o embed de confirmação
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🎉 Recompensa Diária Resgatada!')
            .setDescription(`Você recebeu ${reward} moedas como recompensa diária!`)
            .addFields(
                { name: '💰 Seu saldo atual', value: `${userData.coins} moedas`, inline: true },
            )
            .setFooter({ text: 'Volte amanhã para resgatar novamente!', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [embed] });

        // Log no console
        info.info(`Recompensa diária de ${reward} moedas resgatada por ${user.tag}.`);

    } catch (error) {
        erro.error('Erro ao executar o comando de recompensas', error);
        await interaction.reply({ content: 'Ocorreu um erro ao resgatar sua recompensa diária. Por favor, tente novamente mais tarde.', ephemeral: true });
    }
}

module.exports = { Recompensas };
