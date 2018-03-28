module.exports = (hueApi, database) => {
  const collection = database.collection('lightsdata');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      // Only store state if the light is on.
      const activeLightsData = result.lights
        .filter(light => light.state.on)
        .map(light => ({
          date: scheduleDate,
          lightId: light.uniqueid,
          data: light.state,
        }));

      // Store current state in DB
      collection.insertMany(activeLightsData).then(data => {
        //
      }, error => {
        console.error('Failed to store lights data.', error);
      });
    });
  };
};
