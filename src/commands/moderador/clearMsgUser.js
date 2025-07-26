const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function clearUser(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'clearuser') {

        const isAuthorized = await checkingComandExecuntionModerador(interaction);
        if (!isAuthorized) return;
        
        const numberOfMessages = options.getInteger('numero');
        const user = options.getUser('usuario');

        if (numberOfMessages <= 0 || numberOfMessages > 100) {
            const embed = new EmbedBuilder()
                .setColor('White')
                .setDescription('O número de mensagens a serem deletadas deve estar entre 1 e 100.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(msg => msg.author.id === user.id).first(numberOfMessages);

            if (userMessages.length === 0) {
                await interaction.reply({ content: `Nenhuma mensagem encontrada de ${user.tag}.`, ephemeral: true });
                return;
            }

            await interaction.channel.bulkDelete(userMessages);

            const embed = new EmbedBuilder()
                .setColor(0xffffff)
                .setDescription(`As últimas ${userMessages.length} mensagens de ${user.tag} foram deletadas.`);
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel2.send(`As últimas ${numberOfMessages} mensagens de ${user.tag} foram deletadas por ${interaction.user.tag}.`);

        } catch (error) {
            const errorMessage = error.rawError?.message === 'You can only bulk delete messages that are under 14 days old.' 
                ? 'Você só pode deletar mensagens com menos de 14 dias.'
                : 'Ocorreu um erro ao tentar deletar as mensagens.';

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Erro ao Deletar Mensagens')
                .setDescription(errorMessage);

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};

module.exports = { clearUser };
