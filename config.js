require('dotenv').config();

const requiredEnvs = ['MONGODB_CONNECTIONSTRING', 'HUE_BRIDGE_IP'];
const missingEnvs = requiredEnvs.reduce((errors, envKey) => {
  return process.env[envKey] === undefined ? errors.push(envKey) : errors;
}, []);
if (missingEnvs.length > 0) {
  throw Error(`Missing environment variables: ${missingEnvs.join(', ')}`);
}

module.exports = {
  MONGODB_CONNECTIONSTRING: process.env.MONGODB_CONNECTIONSTRING,
  MONGODB_NAME: process.env.MONGODB_NAME || 'hue-lights-data',
  HUE_BRIDGE_IP: process.env.HUE_BRIDGE_IP,
  HUE_USERNAME: process.env.HUE_USERNAME,
  MQTT_SERVER: process.env.MQTT_SERVER || 'mqtt//192.168.1.210:1883',
  MQTT_CHANNEL: 'nodemcu/tvbank/temp',
};
