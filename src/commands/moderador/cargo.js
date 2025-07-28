const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { client } = require("../../Client");
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function cargo(interaction) {
    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    // Definição de Botões
    const buttons = {
        membro: { id: 'membrocargo', label: 'Membro', emoji: '🟢' },
        masculino: { id: 'masculino', label: 'Masculino', emoji: '💙' },
        feminino: { id: 'feminino', label: 'Feminino', emoji: '❤' },
        naobinario: { id: 'naobinario', label: 'Não binário', emoji: '💜' },
        idade13_15: { id: '13_15', label: '13-15 anos' },
        idade16_17: { id: '16_17', label: '16-17 anos' },
        idade18: { id: 'idade18', label: '18+ anos' },
        trabalhando: { id: 'trabalhando', label: 'Trabalhando' },
        estudando: { id: 'estudando', label: 'Estudando' },
        seguindoavida: { id: 'seguindoavida', label: 'Seguindo a Vida' },

        freefire: { id: 'freefire', label: 'Free Fire', emoji: '🔫' },
        minecraft: { id: 'minecraft', label: 'Minecraft', emoji: '⛏️' },
        valorant: { id: 'valorant', label: 'Valorant', emoji: '🔫' },
        fortnite: { id: 'fortnite', label: 'Fortnite', emoji: '🔫' },
        lol: { id: 'lol', label: 'LOL', emoji: '⚔️' },
        cs: { id: 'cs', label: 'CS', emoji: '🔫' },
        roblox: { id: 'roblox', label: 'Roblox', emoji: '🎮' },
        gtav: { id: 'gtav', label: 'GTAV', emoji: '🚗' },
        clash_royale: { id: 'clash_royale', label: 'Clash Royale', emoji: '🏰' },
        clash_of_clans: { id: 'clash_of_clans', label: 'Clash of Clans', emoji: '🏰' },
        block_squad: { id: 'block_squad', label: 'Block Squad', emoji: '🟩' },
        rocket_league: { id: 'rocket_league', label: 'Rocket League', emoji: '🚗' },
        among_us: { id: 'among_us', label: 'Among Us', emoji: '🚀' },
        red_dead: { id: 'red_dead', label: 'Red Dead', emoji: '🐎' }
    };

    // Função para criar botões de cargo
    const createButtons = (buttonList) =>
        buttonList.map((button) => {
            const buttonBuilder = new ButtonBuilder()
                .setCustomId(button.id)
                .setLabel(button.label)
                .setStyle(ButtonStyle.Secondary);

            // Adiciona o emoji apenas se estiver definido
            if (button.emoji) {
                buttonBuilder.setEmoji(button.emoji);
            }

            return buttonBuilder;
        });

    // Organização dos botões em linhas
    const rows = [
        new ActionRowBuilder().addComponents(createButtons([buttons.membro])),
        new ActionRowBuilder().addComponents(createButtons([buttons.masculino, buttons.feminino, buttons.naobinario])),
        new ActionRowBuilder().addComponents(createButtons([buttons.idade13_15, buttons.idade16_17, buttons.idade18])),
        new ActionRowBuilder().addComponents(createButtons([buttons.trabalhando, buttons.estudando, buttons.seguindoavida])),
        new ActionRowBuilder().addComponents(createButtons([buttons.freefire, buttons.minecraft, buttons.valorant, buttons.fortnite, buttons.lol])),
        new ActionRowBuilder().addComponents(createButtons([buttons.cs, buttons.roblox, buttons.gtav, buttons.clash_royale, buttons.clash_of_clans])),
        new ActionRowBuilder().addComponents(createButtons([buttons.block_squad, buttons.rocket_league, buttons.among_us, buttons.red_dead]))
    ];

    const embedCargoMembro = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle('Clique no cargo de Membro para desbloquear mais canais.');
    const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_CARGOS);

    // Envio das linhas de botões (respeitando o limite de 5 por linha)
    await discordChannel.send({ embeds: [embedCargoMembro], components: [rows[0]] });
    await discordChannel.send({ components: [rows[1]] });
    await discordChannel.send({ components: [rows[2]] });
    await discordChannel.send({ components: [rows[3]] });

    const embedCargosGamers = new EmbedBuilder().setColor(0xffffff).setTitle('Cargos gamers');
    await discordChannel.send({ embeds: [embedCargosGamers], components: [rows[4]] });
    await discordChannel.send({ components: [rows[5]] });
    await discordChannel.send({ components: [rows[6]] });
};

// Listener para interações de botões
client.on('interactionCreate', async (buttonInteraction) => {
    if (!buttonInteraction.isButton()) return;

    const cargoMap = {
        'membrocargo': { title: 'Você recebeu o cargo "Membro".', roleId: process.env.CARGO_MEMBRO },

        'masculino': { title: 'Você recebeu o cargo "Masculino".', roleId: process.env.CARGO_MASCULINO },
        'feminino': { title: 'Você recebeu o cargo "Feminino".', roleId: process.env.CARGO_FEMININO },
        'naobinario': { title: 'Você recebeu o cargo "Nao Binario".', roleId: process.env.CARGO_NAO_BINARIO },
        '13_15': { title: 'Você recebeu o cargo "13_15".', roleId: process.env.CARGO_13_A_15ANOS },
        '16_17': { title: 'Você recebeu o cargo "16_17".', roleId: process.env.CARGO_16_A_17ANOS },
        'idade18': { title: 'Você recebeu o cargo "Idade18".', roleId: process.env.CARGO_18ANOS },
        'trabalhando': { title: 'Você recebeu o cargo "Trabalhando".', roleId: process.env.CARGO_TRABALHANDO },
        'estudando': { title: 'Você recebeu o cargo "Estudando".', roleId: process.env.CARGO_ESTUDANDO },
        'seguindoavida': { title: 'Você recebeu o cargo "Seguindoavida".', roleId: process.env.CARGO_SEGUINDO_A_VIDA },

        'freefire': { title: 'Você recebeu o cargo "Free Fire".', roleId: process.env.CARGO_FREE_FIRE },
        'minecraft': { title: 'Você recebeu o cargo "Minecraft".', roleId: process.env.CARGO_MINECRAFT },
        'valorant': { title: 'Você recebeu o cargo "Valorant".', roleId: process.env.CARGO_VALORANT },
        'fortnite': { title: 'Você recebeu o cargo "Fortnite".', roleId: process.env.CARGO_FORTNIT },
        'lol': { title: 'Você recebeu o cargo "LOL".', roleId: process.env.CARGO_LOL },
        'cs': { title: 'Você recebeu o cargo "CS".', roleId: process.env.CARGO_CS },
        'roblox': { title: 'Você recebeu o cargo "Roblox".', roleId: process.env.CARGO_ROBLOX },
        'gtav': { title: 'Você recebeu o cargo "GTAV".', roleId: process.env.CARGO_GTAV },
        'clash_royale': { title: 'Você recebeu o cargo "Clash Royale".', roleId: process.env.CARGO_CLASH_ROYALE },
        'clash_of_clans': { title: 'Você recebeu o cargo "Clash of Clans".', roleId: process.env.CARGO_CLASH_OF_CLANS },
        'block_squad': { title: 'Você recebeu o cargo "Block Squad".', roleId: process.env.CARGO_BLOCK_SQUAD },
        'rocket_league': { title: 'Você recebeu o cargo "Rocket League".', roleId: process.env.CARGO_ROCKET_LEAGUE },
        'among_us': { title: 'Você recebeu o cargo "Among Us".', roleId: process.env.CARGO_AMONG_US },
        'red_dead': { title: 'Você recebeu o cargo "Red Dead".', roleId: process.env.CARGO_RED_DEAD }
    };

    const selectedCargo = cargoMap[buttonInteraction.customId];
    if (selectedCargo) {
        const embed = new EmbedBuilder().setColor(0xffffff).setTitle(selectedCargo.title);
        const member = buttonInteraction.member;
        await member.roles.add(selectedCargo.roleId);
        await buttonInteraction.reply({ embeds: [embed], ephemeral: true });
    }
});

module.exports = { cargo };
