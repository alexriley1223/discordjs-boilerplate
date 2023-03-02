const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

require('dotenv').config({
    path: path.join(__dirname, '.env'),
})

const commandPath = './commands';
const commands = [];

const token = process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.PROD_TOKEN;
const clientId = process.env.NODE_ENV === 'development' ? process.env.DEV_CLIENT : process.env.PROD_CLIENT;
const guildId = process.env.NODE_ENV === 'development' ? process.env.DEV_GUILD : process.env.PROD_GUILD;

/*
	* Recursively pulls all files from directory
	* @param {string} dirPath Directory of parent folder
	* @param {object} arrayOfCommands Return object for list of file paths
 */
const getAllCommands = function(dirPath, arrayOfCommands) {
    let commandFiles = fs.readdirSync(dirPath);

    arrayOfCommands = arrayOfCommands || []

    commandFiles.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfCommands = getAllCommands(dirPath + "/" + file, arrayOfCommands);
        } else {
            arrayOfCommands.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfCommands;
}

const commandFiles = getAllCommands(commandPath);

// Pull JSON data from each command file to register with Discord
for (const file of commandFiles) {
	const command = require(`./${file}`);
	commands.push(command.data.toJSON());
}

// Register with Discord
const rest = new REST({ version: '9' }).setToken(token);
(async () => {
	try {
    console.log(`Started registering application (/) commands for ${process.env.NODE_ENV}.`);

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully registered application (/) commands for ${process.env.NODE_ENV}`);
	} catch (error) {
		console.error(error);
	}
})();