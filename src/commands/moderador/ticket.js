const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require("discord.js");
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function ticket(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ticket') {

        const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
        if (!authorizedExecutionComand) return;
        const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
        if (!authorizedExecutionComandModerador) return;

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
    }
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
        const category = interaction.guild.channels.cache.get(process.env.CATEGORY_ID);
        if (!category || category.type !== 4) {
            erro.error('Categoria inválida para tickets.');
            return interaction.reply({ content: 'Categoria inválida para tickets.', ephemeral: true });
        }

        const channelName = `ticket-${interaction.user.username}`;
        const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === channelName);
        if (existingChannel) {
            erro.error('Você já possui um ticket aberto.');
            return interaction.reply({ content: 'Você já possui um ticket aberto.', ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: 0,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel], // Ninguém mais vê
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ], // Permissões do criador
                },
                {
                    id: process.env.CARGO_SUPPORT,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ], // Permissões da equipe de suporte
                },
            ],
        });
        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`Ticket criado ${interaction.user.username} no canal <#${ticketChannel.id}>.`);

        await interaction.reply({ content: `Ticket criado com sucesso: <#${ticketChannel.id}>`, ephemeral: true });
        info.info(`Ticket criado com sucesso para ${interaction.user.username} no canal <#${ticketChannel.id}>`);



        const embedTicket = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(`Olá <@${interaction.user.displayName}>`)
            .setDescription('O suporte estará com você em breve. Para fechar esse ticket clique em 🔒')
            .setFooter({ iconURL: client.user.displayAvatarURL({ dynamic: true }), text: `${client.user.tag} - Ticket sem confusão` });

        await ticketChannel.send({ embeds: [embedTicket], components: [btnCloseTicket] });
    }

    // Fechar o ticket e deletar o canal
    if (interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        await interaction.reply({ content: 'O ticket será fechado e o canal será excluído em 5 segundos.', ephemeral: true });
        setTimeout(() => channel.delete(), 5000); // Aguarda 5 segundos antes de deletar o canal

        info.info(`Ticket fechado para ${interaction.user.username}`);
    }
});

module.exports = { ticket };
