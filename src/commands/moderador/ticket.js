const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");
const { client } = require("../../Client");
const { logger, botEvent } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function ticket(interaction) {
    if (!interaction.isCommand()) return;

    const context = {
        module: 'MODERATION',
        command: 'ticket',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

        logger.debug('Iniciando comando ticket', context);

        const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
        if (!authorizedExecutionComand) {
            logger.warn('Comando ticket bloqueado - canal não autorizado', context);
            return;
        }
        
        const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
        if (!authorizedExecutionComandModerador) {
            logger.warn('Comando ticket negado - usuário sem permissão de moderador', context);
            return;
        }

        const criarTicket = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Criar Ticket')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📩');

        const btnOpenTicket = new ActionRowBuilder().addComponents(criarTicket);

        const embedTicket = new EmbedBuilder()
            .setColor(0xffffff)
            .setDescription('Para sugestões, dúvidas ou denúncias, abra seu ticket.')
            .setTitle('Abra seu Ticket.')
            .setFooter({ iconURL: client.user.displayAvatarURL({ dynamic: true }), text: `${client.user.tag} - Ticket sem confusão` });

        await interaction.reply({ content: 'Botão enviado!', ephemeral: true });

        const discordChannel1 = client.channels.cache.get(process.env.CHANNEL_ID_TICKET);
        discordChannel1.send({ embeds: [embedTicket], components: [btnOpenTicket] });

        logger.info('Sistema de ticket configurado com sucesso', context);
};

// Listener único para interações de botões
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const fecharTicket = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Fechar Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

    const btnCloseTicket = new ActionRowBuilder().addComponents(fecharTicket);

    if (interaction.customId === 'create_ticket') {
        const context = {
            module: 'SUPPORT',
            command: 'create_ticket',
            user: interaction.user.tag,
            guild: interaction.guild?.name
        };

        const category = interaction.guild.channels.cache.get(process.env.CATEGORY_ID);
        if (!category || category.type !== 4) {
            logger.error('Categoria inválida para tickets', context);
            return interaction.reply({ content: 'Categoria inválida para tickets.', ephemeral: true });
        }

        const channelName = `ticket-${interaction.user.username}`;
        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);
        if (existingChannel) {
            logger.warn(`Tentativa de criar ticket duplicado para ${interaction.user.tag}`, context);
            return interaction.reply({ content: 'Você já possui um ticket aberto.', ephemeral: true });
        }

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 0,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                    {
                        id: process.env.CARGO_SUPPORT,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.AttachFiles,
                            PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                ],
            });

            await interaction.reply({ content: `Ticket criado com sucesso: <#${ticketChannel.id}>`, ephemeral: true });

            logger.info(`Ticket criado com sucesso - Canal: ${ticketChannel.name}`, {
                ...context,
                channelId: ticketChannel.id
            });

            botEvent('TICKET_CREATED', `${interaction.user.username} criou ticket no canal ${ticketChannel.name}`);

            const embedTicket = new EmbedBuilder()
                .setColor(0xffffff)
                .setTitle(`Olá <@${interaction.user.displayName}>`)
                .setDescription('O suporte estará com você em breve. Para fechar esse ticket clique em 🔒')
                .setFooter({ iconURL: client.user.displayAvatarURL({ dynamic: true }), text: `${client.user.tag} - Ticket sem confusão` });

            await ticketChannel.send({ embeds: [embedTicket], components: [btnCloseTicket] });

        } catch (error) {
            logger.error('Erro ao criar ticket', context, error);
            return interaction.reply({ content: 'Erro ao criar ticket. Tente novamente.', ephemeral: true });
        }
    }

    // Fechar o ticket e deletar o canal
    if (interaction.customId === 'close_ticket') {
        const context = {
            module: 'SUPPORT',
            command: 'close_ticket',
            user: interaction.user.tag,
            guild: interaction.guild?.name
        };

        const channel = interaction.channel;
        await interaction.reply({ content: 'O ticket será fechado e o canal será excluído em 5 segundos.', ephemeral: true });
        
        logger.info(`Ticket fechado - Canal: ${channel.name}`, {
            ...context,
            channelId: channel.id
        });

        botEvent('TICKET_CLOSED', `${interaction.user.username} fechou ticket ${channel.name}`);

        setTimeout(() => channel.delete(), 5000);
    }
});

module.exports = { ticket };
