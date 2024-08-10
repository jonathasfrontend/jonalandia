const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const blockedChannels = require('../config/blockedChannels')

const Help = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId } = interaction;

    if (commandName === 'help') {
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

        const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setAuthor({
            name: client.user.username,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
        })
        .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
        .setTitle('Precisa de ajuda?')
        .setDescription('Aqui estão todos os comandos do bot!')
        .addFields(
            { name: '**/oi**', value: 'Responde com Olá!' },
            { name: '**/regra**', value: 'Responde um embed de regras do servidor (disponivel só para ADMs)' },
            { name: '**/usuario**', value: 'Busca informações do usuário' },
            { name: '**/server**', value: 'Busca informações do servidor' },
            { name: '**/clear**', value: 'Deleta um número especificado de mensagens. Use `**/clear <número>` (disponivel só para ADMs)' },
            { name: '**/help**', value: 'Mostra esta mensagem de ajuda' },
            { name: '\u200B', value: '\u200B' },
            { name: 'Musica', value: 'comando para o colocar musica!' },
            { name: '**/play**', value: 'Toca música. Use `/play <URL>`' },
            { name: '**/pause**', value: 'Pausa a música em reprodução' },
            { name: '**/resume**', value: 'Continua a reprodução da música pausada' },
            { name: '**/kick**', value: 'Remove o bot do canal de voz' },
        )
        .setTimestamp()
        .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

        interaction.reply({ embeds: [embed] });
 }
};

module.exports = { Help };