const { client } = require("../../Client");
const { erro } = require('../../logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const expulsar = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    
    if (commandName === 'expulsar') {
        const user = options.getUser('usuario');

        
        if (blockedChannels.includes(channelId)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle("Este comando não pode ser usado neste canal")
                .setDescription('Vá ao canal <#1254199140796207165> para executar os comandos')
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
        
        if (!user) {
            await interaction.reply({ content: 'Usuário inválido!', ephemeral: true });
            return;
        }
        
        try {
            const member = await interaction.guild.members.fetch(user.id);

            // Mensagem privada para o usuário
            await user.send("Você foi expulso do servidor por atitudes que contrariam as regras do servidor.");

            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel2.send(`O usuário ${user.tag} foi expulso por ${interaction.user.tag}.`);

            // Expulsão do usuário
            await member.kick("Para duvidas fale com o dono do servidor.");
            await interaction.reply({ content: `Usuário ${user.tag} foi expulso com sucesso!`, ephemeral: true });
        } catch (error) {
            erro.error(error);
            await interaction.reply({ content: 'Não foi possível expulsar o usuário.', ephemeral: true });
        }
    }
};

module.exports = { expulsar };
