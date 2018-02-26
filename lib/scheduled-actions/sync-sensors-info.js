module.exports = (hueApi, database) => {
  const collection = database.collection('sensors');
  return (scheduleDate) => {
    hueApi.sensors().then(result => {
      // Update (and add new) devices in DB from time to time...
      result.sensors
        .filter(sensor => sensor.modelid === 'SML001')
        .map(sensor => {
          sensor._id = sensor.uniqueid; // Use hardware ID as DB id
          sensor.lastUpdated = scheduleDate;
          delete sensor.state; // This is stored in another collection.
          collection.update({
            _id: sensor.uniqueid,
          }, sensor, {
            upsert: true, // If document not found, create it.
          }).then(data => {
            console.log(`Synced sensor: ${sensor.name}.`);
          }, error => {
            console.error('Failed to sync sensor.', error);
          });
        });
    });
  };
};
