const MongoClient = require('mongodb').MongoClient;
const chalk = require('chalk');

module.exports = (connectionString) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(connectionString, (err, client) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(chalk.green(`Connected successfully to Mongo Database: ${connectionString}`));
      resolve(client);
    });
  });
};
