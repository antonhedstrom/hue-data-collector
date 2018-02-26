module.exports = (hueApi, database) => {
  const collection = database.collection('sensorsdata');
  return (scheduleDate) => {
    hueApi.sensors().then(result => {
      const sensors = result.sensors
        .filter(sensor => sensor.modelid === 'SML001')
        .map(sensor => ({
          date: scheduleDate,
          sensorId: sensor.uniqueid,
          data: sensor.state,
        }));
      // Store current state for all sensors...
      collection.insertMany(sensors).then(data => {
        //
      }, error => {
        console.error('Failed to store data.', error);
      });
    });
  };
};
