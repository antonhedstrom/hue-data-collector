
# Environment Variables

* `HUE_BRIDGE_IP` (required) - IP to your Philips Hue Bridge
* `MONGODB_CONNECTIONSTRING` (required) - Connection string to Database
* `MONGODB_NAME` (optional) - Name of database to use (defaults to 'hue-lights-data')

# Install

* `npm install`
* `npm start`

# Development

* `npm install`
* `npm run start:dev` // Start mongod daemon and run index

# Requirements

* Philips Hue system
* [node](https://nodejs.org)
* [MongoDB](https://www.mongodb.org/downloads) or [Cloud MongoDB](https://cloud.mongodb.com)
