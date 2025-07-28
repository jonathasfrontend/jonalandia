const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function manutencao(interaction) {
    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    const embed = await new EmbedBuilder()
        .setColor("Red")
        .setTitle('🔧 Em manutenção')
        .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('Canal em manutenção!')
        .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
        .setImage('https://enfoquevisual.com.br/cdn/shop/products/104-022.jpg?v=1571921877')
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

    await interaction.reply({ embeds: [embed] });
};

module.exports = { manutencao };