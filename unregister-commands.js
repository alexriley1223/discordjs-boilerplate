const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '.env'),
});

const token = process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.PROD_TOKEN;
const clientId = process.env.NODE_ENV === 'development' ? process.env.DEV_CLIENT : process.env.PROD_CLIENT;
const guildId = process.env.NODE_ENV === 'development' ? process.env.DEV_GUILD : process.env.PROD_GUILD;

var commands = [];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log(`Started unregistering application (/) commands for ${process.env.NODE_ENV}.`);

    var commandList = await rest.get(
      Routes.applicationGuildCommands(clientId, guildId)
    );

    commandList.forEach(function(command){
        commands.push({ id: command.id, name: command.name });
    });

  } catch (error) {
    console.error(error);
  } finally {
    commands.forEach(function(command){
      try {
        console.log(`Attempting to unregister command /${command.name}.`);
        rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id)).then(function(res){
          console.log(`Successfully unregistered command /${command.name}.`);
        });

      } catch (error) {
        console.error(error);
      }
    });
  }
})();