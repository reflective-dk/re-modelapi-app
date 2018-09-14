define([
    'webix', './state-router', './app-state', './resource'
], function(webix, stateRouter, appState, resource) {
  return function(initialState, defaultState) {
    defaultState = defaultState || initialState;
    webix.ready(function() {
      stateRouter.addState(appState);
      stateRouter.addState(resource);
      stateRouter.on('routeNotFound', function(route, parameters) {
        console.log('route not found', route, defaultState);
        stateRouter.go(defaultState, { route: route });
      });
      stateRouter.evaluateCurrentRoute(initialState);
    });
  };
});
