module.exports = (hueApi, database) => {
  const collection = database.collection('lights');
  return (scheduleDate) => {
    hueApi.lights().then(result => {
      console.log(`Synced ${result.lights.length} lights.`);
      // Update (and add new) devices in DB from time to time...
      result.lights.map(light => {
        light._id = light.uniqueid; // Use hardware ID as DB id
        light.lastUpdated = scheduleDate;
        delete light.state; // This is stored in another collection.
        collection.update({
          _id: light.uniqueid,
        }, light, {
          upsert: true, // If document not found, create it.
        }).then(data => {
          //
        }, error => {
          console.error('Failed to sync lights.', error);
        });
      });
    });
  };
};
