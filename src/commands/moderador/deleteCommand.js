const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../Logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function excluirComando(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, channelId, member } = interaction;

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal permitido para executar os comandos.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription('Você não tem permissão para usar este comando.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        if (commandName === 'excluicomando') {
            const commandName = options.getString('comando');
            if (!commandName) {
                await interaction.reply({ content: 'Você precisa especificar o nome do comando.', ephemeral: true });
                return;
            }

            await client.application.commands.fetch();
            const command = client.application.commands.cache.find(cmd => cmd.name === commandName);

            if (!command) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Comando Não Encontrado')
                    .setDescription(`O comando \`${commandName}\` não foi encontrado.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
                return;
            }

            await client.application.commands.delete(command.id);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Comando Excluído')
                .setDescription(`O comando \`${commandName}\` foi excluído com sucesso.`)
                .setTimestamp()
                .setFooter({ text: `Ação realizada por ${member.user.tag}` });

            await interaction.reply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`O comando \`${commandName}\` foi excluído pelo usuário ${member.user.tag}.`);
            info.info(`O comando \`${commandName}\` foi excluído pelo usuário ${member.user.tag}.`);
        }
    } catch (error) {
        erro.error('Erro ao excluir comando:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao excluir comando: ${error.message}`);
        await interaction.reply({ content: `Erro ao excluir o comando: ${error.message}`, ephemeral: true });
    }
}

module.exports = { excluirComando };
