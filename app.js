const fs = require('fs');
const path = require('path');
const { Client, Collection } = require('discord.js');

require('dotenv').config({
    path: path.join(__dirname, '.env'),
});

const commandPath = './commands';

const token = process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.PROD_TOKEN;

// Initiate client
const client = new Client({ intents: []});

// Initiate events from ./events folder
var eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// Initiate commands from ./commands folder
client.commands = new Collection();

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

// Recursively pull all commands from commandPath folder and subfolders
const commandFiles = getAllCommands(commandPath);

/* Cycle enabled commands and add each command to collection */
for (const file of commandFiles) {
	const command = require(`./${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

/* Cycle enabled events and execute on event call */
for (const file of eventFiles) {
	const event = require(`./events/${file}`);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Login bot
client.login(token);
