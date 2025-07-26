const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { Logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function excluirComando(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

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
            Logger.info(`O comando \`${commandName}\` foi excluído pelo usuário ${member.user.tag}.`);
        }
    } catch (error) {
        Logger.error('Erro ao excluir comando:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao excluir comando: ${error.message}`);
        await interaction.reply({ content: `Erro ao excluir o comando: ${error.message}`, ephemeral: true });
    }
}

module.exports = { excluirComando };
