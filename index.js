const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const packageJSON = require('./package.json');
const config = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const moment = require('moment');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.commands = new Map();

const commands = [];

const loadCommands = async () => {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`[Cardinal] Loaded ${file}.`);
    client.commands.set(command.data.name, command);
    commands.push(command.data);
  }
};

const clientId = config.clientId; // Your bot's client ID
const token = config.token;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('[Cardinal] Started refreshing application (/) commands.');

    await loadCommands();

    await rest.put(
      Routes.applicationCommands(clientId), // Use this line for global commands
      { body: commands },
    );

    console.log('[Cardinal] Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.login(token);

client.on('ready', () => {
  client.user.setPresence({
    status: 'dnd',
    activity: {
      name: '🔴 managing everything',
      type: 'PLAYING'
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (message.channel.type === 'DM') return;

  const [commandName, ...args] = message.content.split(/\s+/);
  const command = client.commands.get(commandName);

  if (command) command.execute(message, args);

  if (!args.length) {
    const loggingNoArgs = `[${moment().format('LLLL')}] Command ${commandName} executed by ${message.author.tag} (ID: ${message.author.id})`;
    console.log(loggingNoArgs);
  } else {
    const loggingArgs = `[${moment().format('LLLL')}] Command ${commandName} ${args.join(' ')} executed by ${message.author.tag} (ID: ${message.author.id})`;
    console.log(loggingArgs);
  }
});
