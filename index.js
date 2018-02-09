// Add env to process.env
require('dotenv').config();

const schedule = require('node-schedule');
const chalk = require('chalk');

const mongoDbClient = require('./mongodb-client');
const hueClient = require('./hue-client');
const actions = require('./scheduled-actions');

const config = require('./config');

mongoDbClient(config.MONGODB_CONNECTIONSTRING).then((dbClient) => {
  const database = dbClient.db(config.MONGODB_NAME);
  const userCollection = database.collection('users');

  hueClient(config.HUE_BRIDGE_IP, userCollection).then((hueApi) => {
    // *    *    *    *    *    *
    // ┬    ┬    ┬    ┬    ┬    ┬
    // │    │    │    │    │    │
    // │    │    │    │    │    └ day of week(0 - 7)(0 or 7 is Sun)
    // │    │    │    │    └───── month(1 - 12)
    // │    │    │    └────────── day of month(1 - 31)
    // │    │    └─────────────── hour(0 - 23)
    // │    └──────────────────── minute(0 - 59)
    // └───────────────────────── second(0 - 59, OPTIONAL)
    schedule.scheduleJob('* */30 * * * *', actions.syncDevicesInfo(hueApi, database));
    schedule.scheduleJob('* */5 * * * *', actions.syncStates(hueApi, database));

  }).catch(error => {
    console.log(chalk.red(error.stack));
    // Since we failed lets clear user table and let user auth again.
    userCollection.deleteMany({}).then(() => {
      console.log('Cleared User Collection.');
    }, () => {
      console.log('Tried to clear Collection but failed.');
    });
  });
}, (error) => {
  console.log(chalk.red(error.stack));
});
