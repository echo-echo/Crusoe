// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
  name: 'Cursoe',
  description: 'The modern message in bottle',
  author: 'Jamie Skinner'
});


App.accessRule('https://*.tiles.mapbox.com/*');
App.accessRule('http://*.tiles.mapbox.com/*');