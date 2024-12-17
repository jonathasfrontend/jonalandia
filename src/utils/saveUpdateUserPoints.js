const User = require('../models/onPerfilUserSechema');

async function saveUpdateUserPoints(user, xp, coins, gems) {
    try {
        xp = isNaN(xp) || xp === undefined ? 0 : Math.floor(xp);
        coins = isNaN(coins) || coins === undefined ? 0 : Math.floor(coins);
        gems = isNaN(gems) || gems === undefined ? 0 : Math.floor(gems);

        const userData = await User.findOneAndUpdate(
            {
                userId: user.id, // Use apenas o identificador único
            },
            {
                $set: {
                    avatarUrl: user.displayAvatarURL({ dynamic: true }),
                    username: user.username,
                    dailyRewardTimestamp: null,
                },
                $inc: {
                    xp,
                    coins,
                    gems,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

        console.log(`Atualizado: ${userData.username} - XP: ${userData.xp}, Moedas: ${userData.coins}, Gemas: ${userData.gems}`);
    } catch (error) {
        console.error(`Erro ao atualizar estatísticas de usuário: ${error.message}`);
    }
}

module.exports = { saveUpdateUserPoints };