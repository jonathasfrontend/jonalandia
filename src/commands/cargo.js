const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { client } = require("../Client");
const blockedChannels = require('../config/blockedChannels')

const cargo = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, member, channelId } = interaction;

    if (commandName === 'cargo') {
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

        const membroCargo = new ButtonBuilder()
        .setCustomId('membrocargo')
        .setLabel('Membro')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🟢');
        
        const freefireCargor = new ButtonBuilder()
        .setCustomId('freefire')
        .setLabel('Free Fire')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔫');

        const minecraftCargor = new ButtonBuilder()
        .setCustomId('minecraft')
        .setLabel('Minecraft')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⛏️');

        const valorantCargor = new ButtonBuilder()
        .setCustomId('valorant')
        .setLabel('Valorant')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔫');

        const fortniteCargor = new ButtonBuilder()
        .setCustomId('fortnite')
        .setLabel('Fortnite')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔫');

        const masculinoCargo = new ButtonBuilder()
        .setCustomId('masculino')
        .setLabel('Masculino')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💙');

        const femininoCargo = new ButtonBuilder()
        .setCustomId('feminino')
        .setLabel('Feminino')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❤');

        const naobinarioCargo = new ButtonBuilder()
        .setCustomId('naobinario')
        .setLabel('Não binário')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💜');

        const idade13_15Cargo = new ButtonBuilder()
        .setCustomId('13_15')
        .setLabel('13-15 anos')
        .setStyle(ButtonStyle.Secondary)

        const idade16_17Cargo = new ButtonBuilder()
        .setCustomId('16_17')
        .setLabel('16-17 anos')
        .setStyle(ButtonStyle.Secondary)

        const idade18Cargo = new ButtonBuilder()
        .setCustomId('idade18')
        .setLabel('18+ anos')
        .setStyle(ButtonStyle.Secondary)

        const trabalhandoCargo = new ButtonBuilder()
        .setCustomId('trabalhando')
        .setLabel('Trabalhando')
        .setStyle(ButtonStyle.Secondary)

        const estudandoCargo = new ButtonBuilder()
        .setCustomId('estudando')
        .setLabel('Estudando')
        .setStyle(ButtonStyle.Secondary)

        const seguindoavidaCargo = new ButtonBuilder()
        .setCustomId('seguindoavida')
        .setLabel('Seguindo a Vida')
        .setStyle(ButtonStyle.Secondary)
        
        const btnCargo = new ActionRowBuilder().addComponents(membroCargo);
        const rowPersona = new ActionRowBuilder().addComponents(masculinoCargo, femininoCargo, naobinarioCargo);
        const rowIdade = new ActionRowBuilder().addComponents(idade13_15Cargo, idade16_17Cargo, idade18Cargo);
        const rowTrab = new ActionRowBuilder().addComponents(trabalhandoCargo, estudandoCargo, seguindoavidaCargo);
        const rowCargosGamers = new ActionRowBuilder().addComponents(freefireCargor, minecraftCargor, valorantCargor, fortniteCargor);

        const embedCargoMembro = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle('Clique no cargo de Membro para desbloquear mais canais.');
        const discordChannel1 = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);
        discordChannel1.send({ embeds: [embedCargoMembro], components: [btnCargo] });

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);
        discordChannel2.send({ components: [rowPersona] });

        const discordChannel3 = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);
        discordChannel3.send({ components: [rowIdade] });

        const discordChannel4 = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);
        discordChannel4.send({ components: [rowTrab] });

        await interaction.reply({ content: 'Botões enviados!', ephemeral: true });

        const embedCargosGamers = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle('Cargos gamers');
        const discordChannel5 = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);
        discordChannel5.send({ embeds: [embedCargosGamers], components: [rowCargosGamers] });

        // const roles = interaction.guild.roles.cache;
        // roles.forEach(role => {
        //     console.log(`Nome do Cargo: ${role.name}, ID do Cargo: ${role.id}`);
        // });
    }
};

// Listener único para interações de botões
client.on('interactionCreate', async (buttonInteraction) => {
    if (!buttonInteraction.isButton()) return;

    let title = '';
    let roleId = '';

    if (buttonInteraction.customId === 'membrocargo') {
        title = 'Você recebeu o cargo "Membro".';
        roleId = process.env.CARGO_MEMBRO;
    } else if (buttonInteraction.customId === 'freefire') {
        title = 'Você recebeu o cargo "Free Fire".';
        roleId = process.env.CARGO_FREE_FIRE;
    } else if (buttonInteraction.customId === 'minecraft') {
        title = 'Você recebeu o cargo "Minecraft".';
        roleId = process.env.CARGO_MINECRAFT;
    } else if (buttonInteraction.customId === 'valorant') {
        title = 'Você recebeu o cargo "Valorant".';
        roleId = process.env.CARGO_VALORANT;
    } else if (buttonInteraction.customId === 'fortnite') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_FORTNIT
    } else if (buttonInteraction.customId === 'masculino') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_MASCULINO
    } else if (buttonInteraction.customId === 'feminino') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_FEMININO
    } else if (buttonInteraction.customId === 'naobinario') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_NAO_BINARIO
    } else if (buttonInteraction.customId === '13_15') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_13_A_15ANOS
    } else if (buttonInteraction.customId === '16_17') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_16_A_17ANOS
    } else if (buttonInteraction.customId === 'idade18') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_18ANOS
    } else if (buttonInteraction.customId === 'trabalhando') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_TRABALHANDO
    } else if (buttonInteraction.customId === 'estudando') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_ESTUDANDO
    } else if (buttonInteraction.customId === 'seguindoavida') {
        title = 'Você recebeu o cargo "Fortnite".';
        roleId = process.env.CARGO_SEGUINDO_A_VIDA
    }

    if (title && roleId) {
        const embed = new EmbedBuilder()
            .setColor(0xffffff)
            .setTitle(title);
        const member = buttonInteraction.member;
        await member.roles.add(roleId);

        await buttonInteraction.reply({ embeds: [embed], ephemeral: true });
    }
});

module.exports = { cargo };
