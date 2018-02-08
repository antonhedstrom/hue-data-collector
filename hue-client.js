
const HueApi = require('node-hue-api').HueApi;
const chalk = require('chalk');

const USER_DESCRIPTION = 'Scheduled Hue Data Collector';
const hue = new HueApi();

module.exports = (bridgeIP, userCollection) => {
  return new Promise((resolve, reject) => {
    userCollection.find({}).toArray(function(err, users) {
      if ( users.length > 0 ) {
        // Use existing user
        const firstUser = users[0];

        if ( firstUser.username ) {
          // Check username...
          const API = new HueApi(bridgeIP, firstUser.username);
          API.getConfig().then(config => {
            // IP address is only set if valid user
            if (config.ipaddress) {
              console.log(chalk.green(`Found valid Hue user created at ${firstUser.createdAt}`));
              resolve(API);
              return;
            }
            reject(new Error('Invalid user.'));
          }, () => {
            reject(new Error('Invalid user.'));
          });
          return;
        }
        else {
          console.log(chalk.yellow('Found User but missing username.'));
        }
      }

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
