module.exports = (hueApi, database) => {
  const statuses = database.collection('statuses');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      // Store current state for all devices...
      statuses.insertMany(result.lights.map(light => {
        return {
          date: scheduleDate,
          device: light.uniqueid,
          data: light.state,
        };
      }));
    });
  };
};
