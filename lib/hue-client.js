
const HueApi = require('node-hue-api').HueApi;
const chalk = require('chalk');

const config = require('../config');

const USER_DESCRIPTION = 'Scheduled Hue Data Collector';

module.exports = (bridgeIP, userCollection) => {
  return new Promise((resolve, reject) => {
    usernameResolver(userCollection).then(username => {
      // Check if username is valid...
      const API = new HueApi(bridgeIP, username);
      API.getConfig().then(config => {
        // IP address is only set if valid user
        if (config.ipaddress) {
          console.log(chalk.green('Hue User is valid.'));
          resolve(API);
          return;
        }
        reject(new Error('Invalid user.'));
      }, () => {
        reject(new Error('Invalid user.'));
      });
    }, () => {
      // Create new user
      waitForButton(bridgeIP).then(username => {
        userCollection.insertOne({
          username,
          createdAt: new Date(),
        }).then((result) => {
          console.log(chalk.green('Stored new user in DB'));
          const API = new HueApi(bridgeIP, result.username);
          resolve(API);
        }, (error) => {
          console.log(chalk.red(error.stack));
        });
      }, error => {
        reject(new Error(error));
      });
    });
  });
};

function waitForButton(bridgeIP, userdesc = USER_DESCRIPTION) {
  console.log(chalk.yellow('Please press Bridge Button'));
  return new Promise((resolve, reject) => {
    let intervalId = setInterval(() => {
      try {
        const hue = new HueApi();
        hue.registerUser(bridgeIP, userdesc)
          .then((result) => {
            intervalId && clearInterval(intervalId);
            intervalId = null;
            console.log(chalk.green(`Button pressed!\nCreated user: ${JSON.stringify(result)}`));
            resolve(result);
          })
          .fail(() => {
            console.log('Waiting for button press...');
          })
          .done();
      } catch(error) {
        console.error(error);
      }
    }, 2000);

    setTimeout(() => {
      if ( intervalId ) {
        console.log(chalk.yellow('Waited for 30 secs. You are too slow.'));
        clearInterval(intervalId);
        reject('Button never pressed.');
      }
    }, 30000);
  });
}

function usernameResolver(userCollection) {
  return new Promise((resolve, reject) => {
    // If in env, use that
    if (config.HUE_USERNAME) {
      return resolve(config.HUE_USERNAME);
    }

    // Otherwise look into DB...
    userCollection.find({}).toArray(function(err, users) {
      if (users.length === 0) {
        return reject('No users found in DB.');
      }

      // Use first existing user
      if (users[0].username) {
        console.log('Found user in DB: ', users[0]);
        resolve(users[0].username);
      }
      else {
        reject('\'Username\' missing for user.', users[0]);
      }
    });
  });
}
