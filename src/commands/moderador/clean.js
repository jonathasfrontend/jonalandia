const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function clean(interaction) {
    if (!interaction.isCommand()) return;

    const { options } = interaction;

    const isAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!isAuthorized) return;

    const tipoLimpeza = options.getString('tipo');
    const numeroMensagens = options.getInteger('quantidade');

    // Validação do número de mensagens
    if (numeroMensagens <= 0 || numeroMensagens > 100) {
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
        if (tipoLimpeza === 'usuario') {
            // Limpeza de mensagens de um usuário específico
            const usuario = options.getUser('usuario');

            if (!usuario) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('Você deve especificar um usuário quando escolher limpar mensagens de usuário.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(msg => msg.author.id === usuario.id).first(numeroMensagens);

            if (userMessages.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription(`Nenhuma mensagem encontrada de ${usuario.tag}.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            await interaction.channel.bulkDelete(userMessages);

            const successEmbed = new EmbedBuilder()
                .setColor(0xffffff)
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`✅ As últimas ${userMessages.length} mensagens de ${usuario.tag} foram deletadas.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });

            // Log da ação
            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (discordChannel2) {
                discordChannel2.send(`🧹 As últimas ${userMessages.length} mensagens de ${usuario.tag} foram deletadas por ${interaction.user.tag}.`);
            }

        } else if (tipoLimpeza === 'todas') {
            // Limpeza de todas as mensagens do canal
            const fetched = await interaction.channel.messages.fetch({ limit: numeroMensagens });
            await interaction.channel.bulkDelete(fetched);

            const successEmbed = new EmbedBuilder()
                .setColor(0xffffff)
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`✅ As últimas ${numeroMensagens} mensagens foram deletadas do canal.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });

            // Log da ação
            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (discordChannel2) {
                discordChannel2.send(`🧹 As últimas ${numeroMensagens} mensagens foram deletadas do canal por ${interaction.user.tag}.`);
            }
        }

    } catch (error) {
        let errorMessage = 'Ocorreu um erro ao tentar deletar as mensagens.';
        if (error.rawError && error.rawError.message === 'You can only bulk delete messages that are under 14 days old.') {
            errorMessage = 'Você só pode deletar mensagens que têm menos de 14 dias.';
        } else if (error.message.includes('Missing Permissions')) {
            errorMessage = 'O bot não tem permissões suficientes para deletar mensagens.';
        }

        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle('❌ Erro ao Deletar Mensagens')
            .setDescription(errorMessage)
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = { clean };
