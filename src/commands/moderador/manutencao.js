const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const blockedChannels = require('../../config/blockedChannels')

const manutencao = async (interaction) => {
 if (!interaction.isCommand()) return;
 
 const { commandName, member, channelId } = interaction;
 
 if (commandName === 'manutencao'){
  if (blockedChannels.includes(channelId)) {
    const embed = new EmbedBuilder()
        .setColor('Red')
        .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("Este comando não pode ser usado neste canal")
        .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
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
 }
};

module.exports = { manutencao };