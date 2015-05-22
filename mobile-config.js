//need this for mobile to work.
App.info({
  name: 'Crusoe',
  description: 'The modern message in bottle',
  author: 'Jamie Skinner'
});
App.accessRule('https://*.tiles.mapbox.com/*');
App.accessRule('http://*.tiles.mapbox.com/*');
App.accessRule('https://*.googleapis.com/*');
App.accessRule('https://*.google.com/*');
App.accessRule('https://*.gstatic.com/*');
