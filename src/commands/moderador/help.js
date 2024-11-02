const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const blockedChannels = require('../../config/blockedChannels')

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
                { name: 'Funcionalidades do Bot', value: 'Este bot foi desenvolvido para gerenciar a comunidade, oferecer suporte e entretenimento. Ele possui funções como:', inline: false },
                { name: '\u200B', value: '\u200B' },
                { name: '**/help**', value: 'Mostra esta mensagem de ajuda' },
                { name: '**/oi**', value: 'Responde com Olá!' },
                { name: '**/usuario**', value: 'Busca informações do usuário' },
                { name: '**/server**', value: 'Busca informações do servidor' },
                { name: '**/clearall**', value: 'Deleta um número especificado de mensagens. Use `/clearall <número>` (disponível só para ADMs)' },
                { name: '**/clearuser**', value: 'Deleta mensagens de um usuário específico. Use `/clearuser <número> <usuário>` (disponível só para ADMs)' },
                { name: '**/cargo**', value: 'Comando para mostrar botões dos cargos! (disponível só para ADMs)' },
                { name: '**/ticket**', value: 'Comando para mostrar botão para abrir um ticket' },
                { name: '**/manutencao**', value: 'Menssagem de manutenção! (disponível só para ADMs)' },
                { name: '**/embed**', value: 'Cria um embed de exemplo no canal (disponível só para ADMs)' },
                { name: '**/birthday**', value: 'Registra o dia do seu aniversário' }
            )
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

        interaction.reply({ embeds: [embed] });
    }
};

module.exports = { Help };