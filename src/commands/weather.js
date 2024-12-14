const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { client } = require("../Client");
const { info, erro } = require('../Logger');
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function getWeather(interaction) {
    const city = interaction.options.getString("cidade");
    const { channelId } = interaction;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

    try {
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
        
        await interaction.deferReply();

        const response = await axios.get(url);
        const data = response.data;

        const embed = new EmbedBuilder()
            .setColor("FFFFFF")
            .setTitle(`**Clima em ${data.name}**`)
            .setDescription(`> ### **${data.weather?.[0]?.description}**` || "Descrição não disponível")
            .setThumbnail(`http://openweathermap.org/img/wn/${data.weather?.[0]?.icon}.png`)
            .addFields(
                { name: "🌡️ Temperatura", value: `${data.main.temp}°C`, inline: true },
                { name: "🌡️ Sensação Térmica", value: `${data.main.feels_like}°C`, inline: true },
                { name: "💧 Umidade", value: `${data.main.humidity}%`, inline: true },
                // { name: '\u200B', value: '\u200B', inline: true },
                { name: "🌬️ Velocidade do Vento", value: `${data.wind.speed} m/s`, inline: true },
                { name: "🌅 Nascer do Sol", value: new Date(data.sys.sunrise * 1000).toLocaleTimeString(), inline: true },
                { name: "🌇 Pôr do Sol", value: new Date(data.sys.sunset * 1000).toLocaleTimeString(), inline: true },
                { name: "🌍 Coordenadas", value: `Latitude: ${data.coord.lat}\nLongitude: ${data.coord.lon}`, inline: true },
                { name: "🌐 Visibilidade", value: `${(data.visibility / 1000) || "N/A"} km`, inline: true },
                { name: "🌐 Pressão", value: `${data.main.pressure} hPa`, inline: true },
                { name: "🌐 Chuva (1h)", value: `${data.rain?.['1h'] || 0} mm`, inline: true },
                { name: "☁️ Nuvens", value: `${data.clouds?.all || 0}%`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ embeds: [embed] });

        saveUpdateUserPoints(interaction.user, 10, 5, 1);

        info.info(`Clima em ${data.name} consultado por ${interaction.user.tag}`);

        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`Clima em ${data.name} consultado por ${interaction.user.tag}`);

    } catch (error) {
        erro.error("Erro ao buscar clima:", error);
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: "Cidade não encontrada ou erro ao acessar a API. Tente novamente.", ephemeral: true });
        } else {
            await interaction.reply({ content: "Cidade não encontrada ou erro ao acessar a API. Tente novamente.", ephemeral: true });
        }
    }
};

module.exports = { getWeather };
