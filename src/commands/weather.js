const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { client } = require("../Client");
const { info, erro } = require('../Logger');
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");
const { checkingComandChannelBlocked } = require('../utils/checkingComandsExecution');

async function getWeather(interaction) {
    const { commandName } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    try {
        if (commandName === 'clima') {
            const city = interaction.options.getString("cidade");
            const apiKey = process.env.OPENWEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;
        
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
        
            saveUpdateUserPoints(interaction.user, 100, 80, 1);

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Usuário ${interaction.user.username} consultou o clima em ${city}.`);
            info.info(`Usuário ${interaction.user.username} consultou o clima em ${city}.`);
        
        }
    } catch (error) {
        erro.error('Erro ao executar o comando', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao executar o comando: ${error.message}`);
    }
};

module.exports = { getWeather };
