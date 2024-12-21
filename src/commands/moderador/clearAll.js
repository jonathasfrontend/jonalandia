const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function clearAll(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'clearall') {

        const isAuthorized = await checkingComandExecuntionModerador(interaction);
        if (!isAuthorized) return;


        if (options.data.length > 0 && options.data[0].name === 'number') {
            const numberOfMessages = options.data[0].value;

            if (numberOfMessages <= 0 || numberOfMessages > 100) {
                const embed = new EmbedBuilder()
                    .setColor('White')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription('O número de mensagens a serem deletadas deve estar entre 1 e 100.')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            try {
                const fetched = await interaction.channel.messages.fetch({ limit: numberOfMessages });
                await interaction.channel.bulkDelete(fetched);

                const embed = new EmbedBuilder()
                    .setColor(0xffffff)
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`As últimas ${numberOfMessages} mensagens foram deletadas.`)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
                await interaction.reply({ embeds: [embed], ephemeral: true });

                const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
                discordChannel2.send(`As últimas ${numberOfMessages} mensagens foram deletadas por ${interaction.user.tag} `)

            } catch (error) {
                let errorMessage = 'Ocorreu um erro ao tentar deletar as mensagens.';
                if (error.rawError && error.rawError.message === 'You can only bulk delete messages that are under 14 days old.') {
                    errorMessage = 'Você só pode deletar mensagens que têm menos de 14 dias.';
                }

                const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle('Erro ao Deletar Mensagens')
                    .setDescription(errorMessage)
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        } else {
            await interaction.reply('**Use `/clear` <número de mensagens>.**');
        }
    }
};

module.exports = { clearAll };
