module.exports = (hueApi, database) => {
  const devices = database.collection('devices');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      // Update (and add new) devices in DB from time to time...
      result.lights.map(light => {
        light._id = light.uniqueid; // Use hardware ID as DB id
        light.lastUpdated = scheduleDate;
        delete light.state; // This is stored in another collection.
        devices.update({
          _id: light.uniqueid,
        }, light, {
          upsert: true, // If document not found, create it.
        });
      });
    });
  };
};
