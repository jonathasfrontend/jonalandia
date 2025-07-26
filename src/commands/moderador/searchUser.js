const { EmbedBuilder } = require('discord.js');
const InfractionUser = require('../../models/onInfracoesUsersSchema');
const { client } = require("../../Client");
const { Logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function perfilInfoUser(interaction) {
    const { commandName, options, guild } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {
        await interaction.deferReply();

        const userOption = options.getUser('usuario');
        if (!userOption) {
            return interaction.editReply({
                content: '❌ Usuário não especificado ou inválido.',
                ephemeral: true,
            });
        }

        const userId = userOption.id;
        const user = await client.users.fetch(userId);
        const member = await guild.members.fetch(userId);

        if (!user) {
            return interaction.editReply({
                content: '❌ Não foi possível encontrar este usuário no Discord.',
                ephemeral: true,
            });
        }

        if (!member) {
            return interaction.editReply({
                content: '❌ Este usuário não está neste servidor.',
                ephemeral: true,
            });
        }

        const infractionData = await InfractionUser.findOne({ username: user.tag });

        // Função para formatar duração
        const formatDuration = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const months = Math.floor(days / 30);
            const years = Math.floor(days / 365);

            if (years > 0) return `${years} anos`;
            if (months > 0) return `${months} meses`;
            if (days > 0) return `${days} dias`;
            if (hours > 0) return `${hours} horas`;
            if (minutes > 0) return `${minutes} minutos`;
            return `${seconds} segundos`;
        };

        const now = new Date();
        const accountCreation = user.createdAt;
        const serverJoin = member.joinedAt;

        if (!accountCreation || !serverJoin) {
            return interaction.editReply({
                content: '❌ Erro ao obter as datas do usuário.',
                ephemeral: true,
            });
        }

        const creationDiff = formatDuration(now - accountCreation);
        const joinDiff = formatDuration(now - serverJoin);

        // Criar embed com dados combinados
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle(`Perfil Completo de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: client.user ? `Por: ${client.user.tag}` : "Por: Bot",
                iconURL: client.user ? client.user.displayAvatarURL({ dynamic: true }) : undefined
            })
            .addFields(
                { name: '👤 Nome', value: `**${user.tag}**`, inline: true },
                { name: '🆔 ID', value: `**${user.id}**`, inline: true },
                { name: '👤 Menção', value: `<@${user.id}>`, inline: true },
                { name: '✅ Conta Criada', value: `${accountCreation.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${creationDiff})`, inline: false },
                { name: '🟦 Entrou no Servidor', value: `${serverJoin.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${joinDiff})`, inline: false }
            );

        if (infractionData) {
            const infractions = infractionData.infractions || {};
            embed.addFields(
                {
                    name: '📊 Infrações',
                    value: `
                        🗣️ Linguagem Inapropriada: ${infractions.inappropriateLanguage || 0}
                        ⏳ Timeouts: ${infractions.timeouts || 0}
                        🚪 Expulsões de Canal de Voz: ${infractions.voiceChannelKicks || 0}
                        🚪 Expulsões do Servidor: ${infractions.expulsion || 0}
                        ⛔ Bans: ${infractions.bans || 0}
                        🔓 Unbans: ${infractions.unbans || 0}
                        💬 Flood Timeouts: ${infractions.floodTimeouts || 0}
                        📂 Arquivos Bloqueados: ${infractions.blockedFiles || 0}
                        🔗 Links Postados: ${infractions.serverLinksPosted || 0}`,
                    inline: false,
                }
            );

            if (infractionData.logs && infractionData.logs.length > 0) {
                const logs = infractionData.logs
                    .slice(-5) // Pega apenas os últimos 5 logs para evitar limite de caracteres
                    .map((log) => `**${log.type}:** ${log.reason}\n*(por ${log.moderator} em ${new Date(log.date).toLocaleDateString()})*`)
                    .join('\n\n');

                // Verifica se o texto dos logs não excede 1024 caracteres (limite do Discord)
                const logsText = logs.length > 1024 ? logs.substring(0, 1020) + '...' : logs;
                embed.addFields({ name: '📜 Logs de Moderação (Últimos 5)', value: logsText });
            } else {
                embed.addFields({ name: '📜 Logs de Moderação', value: 'Nenhum log encontrado.' });
            }
        } else {
            embed.addFields(
                { name: '📊 Infrações', value: 'Nenhum dado de infrações encontrado no banco de dados.', inline: false },
                { name: '📜 Logs de Moderação', value: 'Nenhum log encontrado.', inline: false }
            );
        }

        await interaction.editReply({ embeds: [embed] });

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            await logChannel.send(`Comando de perfil executado para ${user.tag} por ${interaction.user.tag} no servidor ${interaction.guild.name}`);
        }
        Logger.info(`Comando de perfil executado com sucesso para ${user.tag}`);
    } catch (error) {
        Logger.error('Erro ao executar o comando de perfil', error);

        // Resposta de erro mais específica para o usuário
        let errorMessage = '❌ Ocorreu um erro ao buscar os dados do usuário.';

        if (error.message.includes('Unknown User')) {
            errorMessage = '❌ Usuário não encontrado no Discord.';
        } else if (error.message.includes('Unknown Member')) {
            errorMessage = '❌ Usuário não encontrado neste servidor.';
        } else if (error.message.includes('Received one or more errors')) {
            errorMessage = '❌ Erro na formatação dos dados. Tente novamente.';
        }

        try {
            await interaction.editReply({
                content: errorMessage,
                ephemeral: true
            });
        } catch (replyError) {
            Logger.error('Erro ao enviar resposta de erro', replyError);
        }

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) {
            await logChannel.send(`Erro ao executar o comando de perfil: ${error.message}\nUsuário: ${interaction.user.tag}\nServidor: ${interaction.guild.name}`);
        }
    }
}

module.exports = { perfilInfoUser };
