// Add env to process.env
require('dotenv').config();

const schedule = require('node-schedule');
const chalk = require('chalk');
const mqtt = require('mqtt');

const mongoDbClient = require('./lib/mongodb-client');
const hueClient = require('./lib/hue-client');
const actions = require('./lib/scheduled-actions');

const config = require('./config');

mongoDbClient(config.MONGODB_CONNECTIONSTRING).then((dbClient) => {
  const database = dbClient.db(config.MONGODB_NAME);
  const userCollection = database.collection('users');

  const mqttClient = mqtt.connect(config.MQTT_SERVER);
  mqttClient.on('connect', function() {
    actions.subscribeMQTT(mqttClient, database);
  });

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
    schedule.scheduleJob('* */30 * * * *', actions.syncLightsInfo(hueApi, database));
    schedule.scheduleJob('* */30 * * * *', actions.syncSensorsInfo(hueApi, database));
    schedule.scheduleJob('* */5 * * * *', actions.syncLightsData(hueApi, database));
    schedule.scheduleJob('* */5 * * * *', actions.syncSensorsData(hueApi, database));

    // Sync device data upon start
    actions.syncLightsInfo(hueApi, database);
    actions.syncSensorsInfo(hueApi, database);

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
