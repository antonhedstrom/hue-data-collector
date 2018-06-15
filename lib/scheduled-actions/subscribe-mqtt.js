const schedule = require('node-schedule');

const config = require('../../config');

module.exports = (mqttClient, database) => {
  let latestTempature;
  const collection = database.collection('tempatures');

  mqttClient.subscribe(config.MQTT_CHANNEL);
  // mqttClient.publish(channel, 'MQTT is alive and listening');

  mqttClient.on('message', function(topic, message) {
    latestTempature = message.toString();
    // message is Buffer
    // console.log("Raspberry service got: ", message.toString())
  });

  schedule.scheduleJob('* */30 * * * *', (scheduleDate) => {
    if ( latestTempature ) {
      collection.insert({
        date: scheduleDate,
        location: 'balcony',
        temp: latestTempature,
      });
    }
  });
};
