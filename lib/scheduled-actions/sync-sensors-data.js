module.exports = (hueApi, database) => {
  const collection = database.collection('sensors-data');
  return (scheduleDate) => {
    hueApi.sensors().then(result => { // DOES IT EXISTS? .sensors()
      // Store current state for all sensors...
      collection.insertMany(result.sensors.map(sensor => {
        return {
          date: scheduleDate,
          device: sensor.uniqueid,
          data: sensor.state,
        };
      })).then(data => {
        //
      }, error => {
        console.error('Failed to store data.', error);
      });
    });
  };
};
