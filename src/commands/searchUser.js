const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../logger');
const blockedChannels = require('../config/blockedChannels')

const searchUser = async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName, options, channelId } = interaction;

    if (commandName === 'usuario') {
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

        const userInput = options.getString('usuario');
        if (userInput) {
            const userIdMatch = userInput.match(/^<@!?(\d+)>$/);
            const userId = userIdMatch ? userIdMatch[1] : userInput;

            try {
                const user = await client.users.fetch(userId);
                // Busca o membro do servidor pelo ID do usuário
                const member = await interaction.guild.members.fetch(userId);

                // Função para formatar a diferença de tempo
                const formatDuration = (ms) => {
                    const seconds = Math.floor(ms /  1000);
                    const minutes = Math.floor(seconds /  60);
                    const hours = Math.floor(minutes /  60);
                    const days = Math.floor(hours /  24);
                    const months = Math.floor(days /  30);
                    const years = Math.floor(days /  365);

                    if (years >  0) return `${years} anos`;
                    if (months >  0) return `${months} mêses`;
                    if (days >  0) return `${days} dias`;
                    if (hours >  0) return `${hours} horas`;
                    if (minutes >  0) return `${minutes} minutos`;
                    return `${seconds} segundos`;
                };

                const now = new Date();
                const accountCreation = user.createdAt;
                const serverJoin = member.joinedAt;

                const creationDiff = formatDuration(now - accountCreation);
                const joinDiff = formatDuration(now - serverJoin);
               
                const embed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle(`${member.displayName}`)
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`Informações do Usuário`)
                    .addFields(
                        { name: 'Nome', value: `${user.tag}`, inline: true },
                        { name: 'Indentidade', value: `${user.id}`, inline: true },
                        { name: 'Menção', value: `<@${user.id}>`, inline: true },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Conta Criada', value: `${accountCreation.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} às ${accountCreation.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (há ${creationDiff})`, inline: false },
                        { name: 'Entrou Em', value: `${serverJoin.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} às ${serverJoin.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (há ${joinDiff})`, inline: false },
                    )
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    
                    await interaction.reply({ embeds: [embed] });

            } catch (error) {
                erro.error(error);

                const embed = await new EmbedBuilder()
                .setColor("#ffa600")
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription('Usuário não encontrado ou ID inválido.')
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else {
            const embed = await new EmbedBuilder()
                .setColor("#ff3c00")
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription('Por favor, forneça o nome do usuário a ser consultado.')
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
                await interaction.reply({ embeds: [embed], ephemeral: true });
            
        }
    }
};

module.exports = { searchUser };
