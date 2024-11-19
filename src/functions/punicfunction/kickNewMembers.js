const { EmbedBuilder } = require('discord.js');
const { info, erro } = require('../../logger');
const { client } = require("../../Client");

async function autoKickNewMembers() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
        return info.info('Guild não encontrada.');
    }

    const members = await guild.members.fetch();

    members.forEach(async (member) => {
        const accountCreatedAt = member.user.createdAt;
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Verifica se a conta foi criada há menos de 7 dias
        if (accountCreatedAt > sevenDaysAgo && !member.user.bot) {
            try {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Expulsão do Servidor')
                    .setDescription(`Olá ${member.user.tag}, sua conta foi criada há menos de 7 dias e, por isso, você foi expulso do servidor **${guild.name}**.`)
                    .addFields(
                        { name: 'Motivo', value: 'Conta criada em menos de 7 dias', inline: true },
                        { name: 'Data de criação da conta', value: `${accountCreatedAt.toLocaleDateString()}`, inline: true }
                    )
                    .setFooter({ text: `Expulsão realizada por ${guild.owner?.user.tag}`, iconURL: guild.iconURL() })
                    .setTimestamp();
                await member.send({ embeds: [embed] });
                info.info(`Mensagem enviada ao membro ${member.user.tag} antes da expulsão.`);

                await member.kick('Conta criada há menos de 7 dias');

                const logEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Membro Expulso')
                    .setDescription(`O membro ${member.user.tag} foi expulso por conta nova (criada há menos de 7 dias).`)
                    .addFields(
                        { name: 'Data de criação da conta', value: `${accountCreatedAt.toLocaleDateString()}`, inline: true },
                        { name: 'Expulsão realizada por', value: `${guild.owner?.user.tag}`, inline: true }
                    )
                    .setFooter({ text: `Expulsão registrada em ${now.toLocaleString()}`, iconURL: guild.iconURL() })
                    .setTimestamp();

                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                await discordChannel.send({ embeds: [logEmbed] });

                info.info(`Membro ${member.user.tag} foi expulso por conta nova.`);

            } catch (error) {
                erro.error(`Erro ao expulsar membro ${member.user.tag}:`, error);
                
                const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                discordChannel.send(`Erro ao expulsar o membro ${member.user.tag}: ${error.message}`);
            }
        }
    });
}

module.exports = { autoKickNewMembers };
