module.exports = (hueApi, database) => {
  const collection = database.collection('lightsdata');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      const lightsData = result.lights.map(light => {
        return {
          date: scheduleDate,
          lightId: light.uniqueid,
          data: light.state.on ? light.state : { on: false },
        };
      });
      // Store current state for all devices...
      collection.insertMany(lightsData).then(data => {
        //
      }, error => {
        console.error('Failed to store lights data.', error);
      });
    });
  };
};
