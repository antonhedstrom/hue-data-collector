module.exports = (hueApi, database) => {
  const collection = database.collection('lights-data');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      // Store current state for all devices...
      collection.insertMany(result.lights.map(light => {
        return {
          date: scheduleDate,
          device: light.uniqueid,
          data: light.state,
        };
      })).then(data => {
        //
      }, error => {
        console.error('Failed to store lights data.', error);
      });
    });
  };
};
