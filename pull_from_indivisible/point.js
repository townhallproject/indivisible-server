class Point {
  constructor(group) {
    this.type = 'Feature';
    this.geometry = {
      type: 'Point',
      coordinates: [Number(group.longitude), Number(group.latitude)],
    };
    this.properties = {
      icon: group.icon,
      city: group.city,
      state: group.state,
      email: group.email || false,
      twitter: group.twitter || false,
      facebook: group.facebook || false,
      title: group.title || group.name,
      id: group.id || false,
    };
  }
}

// export default Point;
module.exports = (items) => {
  const featuresHome = {
    type: 'FeatureCollection',
    features: [],
  };
  featuresHome.features = items
    .filter((group) => {
      return group.latitude;
    })
    .map((group) => {
      group.icon = 'circle-15-blue';
      group.filterBy = false;
      group.color = '#1cb7ec';
      console.log(group.email)
      const newFeature = new Point(group);
      return newFeature;
    });
  return featuresHome;
};
