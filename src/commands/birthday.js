const { info, erro } = require('../logger');
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");
const { checkingComandChannelBlocked } = require("../utils/checkingComandsExecution");

async function Birthday (interaction){
    const { commandName } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    if (commandName === 'birthday') {

        const day = interaction.options.getInteger('dia');
        const month = interaction.options.getInteger('mes');
        const userId = interaction.user.id;
        const username = interaction.user.username;

        if (day < 1 || day > 31 || month < 1 || month > 12) {
            return interaction.reply({ content: 'Por favor, insira uma data válida.', ephemeral: true });
        }
        
        const birthday = new onNotificationBirthdaySchema({
            userId,
            name: username,
            day,
            month,
        });
        
        await birthday.save();

        await interaction.reply(`Aniversário salvo: ${day}/${month}`);
        info.info(`Aniversário salvo: ${day}/${month} para ${username}`);

        saveUpdateUserPoints(interaction.user, 100, 50, 1);

    }
}

module.exports = { Birthday };