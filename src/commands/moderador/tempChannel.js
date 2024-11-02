const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const tempChannel = async (interaction) => {
    const { commandName, member, options, channelId } = interaction;

    if (commandName === 'tempchannel') {
        const channelName = options.getString('nome');
        const categoryId = options.getChannel('categoria')?.id;
        const action = options.getString('acao');   

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

        try {
            if (action === 'criar') {
                
                const newChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0,
                    parent: categoryId,
                });
                if (!channelName || channelName.trim().length === 0) {
                    await interaction.reply({
                        content: 'Você deve fornecer um nome para o canal.',
                        ephemeral: true,
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`Canal ${newChannel} criado com sucesso!`)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });

                const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
                discordChannel2.send(`Novo canal ${newChannel} criado por ${member}`);

            } else if (action === 'deletar') {
                const channel = interaction.guild.channels.cache.find(c => c.name === channelName && c.parentId === categoryId);

                if (channel) {
                    await channel.delete();
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`Canal ${channelName} deletado com sucesso!`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed] });

                    const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
                    discordChannel2.send(`Canal ${channelName} deletado por ${member}`);
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`Canal ${channelName} não encontrado na categoria especificada.`)
                        .setTimestamp();
                    await interaction.reply({ embeds: [embed] });
                    const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT)
                    discordChannel2.send(`Canal ${channelName} não encontrado na categoria especificada.`);
                }
            }
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('Ocorreu um erro ao tentar executar o comando.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT)
            discordChannel2.send(`Ocorreu um erro ao tentar executar o comando.`);
        }
    }
};

module.exports = { tempChannel };