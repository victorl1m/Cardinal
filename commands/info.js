const { EmbedBuilder } = require('discord.js');
const axios = require('axios'); // You may need to install the axios package

module.exports = {
  data: {
    name: 'info',
    description: 'Retorna informações sobre o jogador',
    options: [
      {
        name: 'name_of_player',
        description: 'Nome do jogador',
        type: 3, // 3 represents a string type
        required: true,
      },
      {
        name: 'tag_of_player',
        description: 'Tag do jogador',
        type: 3,
        required: true,
      },
    ],
  },
  async execute(interaction) {
    let nameOfPlayer = interaction.options.getString('name_of_player');
    const tagOfPlayer = interaction.options.getString('tag_of_player');

    nameOfPlayer = encodeURIComponent(nameOfPlayer);

    if (!nameOfPlayer || !tagOfPlayer) {
      // Handle the case where the options are not provided
      await interaction.reply('Por favor, forneça o nome e a tag do jogador.');
      return;
    }

    const apiKey = "HDEV-cb43c6cb-2e2c-4f36-8705-36114a77bc15";

    interaction.deferReply({ ephemeral: false })

    try {
      // Make a REST request to fetch the player's data (replace with your actual API endpoint)
      const playerInfo = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/account/${nameOfPlayer}/${tagOfPlayer}?force=true`,
        {
          headers: {
            "X-API-KEY": apiKey,
          },
        }
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const historyInfo = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/mmr-history/br/${nameOfPlayer}/${tagOfPlayer}?force=true`,
        {
          headers: {
            "X-API-KEY": apiKey,
          },
        }
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const matchesInfo = await axios.get(
        `https://api.henrikdev.xyz/valorant/v1/lifetime/matches/br/${nameOfPlayer}/${tagOfPlayer}?force=true`,
        {
          headers: {
            "X-API-KEY": apiKey,
          },
        }
      );

      const playerData = playerInfo.data.data;
      const matchesData = matchesInfo.data.data;
      const lastMatch = historyInfo.data.data[0];

      let lastMmr = "0"
      let totalBodyshots = 0;
      let totalLegshots = 0;
      let totalHeadshots = 0;

      for (const match of matchesData) {
        if (match.stats) {
          const shots = match.stats.shots;
          totalBodyshots += shots.body;
          totalLegshots += shots.leg;
          totalHeadshots += shots.head;
        }
      }

      const totalShotsFired = totalBodyshots + totalLegshots + totalHeadshots;
      const headshotPercentage = (totalHeadshots / totalShotsFired) * 100;

      if (lastMatch.mmr_change_to_last_game.toString().includes('-')) {
        lastMmr = `**${lastMatch.mmr_change_to_last_game}** LP`;
      } else {
        lastMmr = `**+${lastMatch.mmr_change_to_last_game}** LP`;
      }

      const embed = new EmbedBuilder()
      .setAuthor({ name: 'Informações do jogador', iconURL: playerData.card.small })
        .setColor('#2ecc71')
        .setThumbnail(lastMatch.images.large)
        .addFields(
          { name: 'Nome', value: `${playerData.name}#${tagOfPlayer}`, inline: true },
          { name: 'Level', value: `${playerData.account_level}`, inline: true },
          { name: 'Rank', value: `${lastMatch.currenttierpatched}`},
          { name: 'Última partida', value: `${lastMmr}`, inline: true},
          { name: `HS% Total (${matchesInfo.data.data[0].meta.season.short})`, value: `${headshotPercentage.toFixed(2)}%`, inline: true}
        )
        .setFooter({ text: `Última atualização:  ${playerData.last_update}`, iconURL: 'https://i.imgur.com/c8FulD1.png' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({content: 'Ocorreu um erro ao buscar as informações do jogador. Verifique se o jogador existe e tente novamente.'});
    }
  },
  register(client) {
    client.commands.set(this.data.name, this);
  },
};
