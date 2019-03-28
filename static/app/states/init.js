define([
    'webix', './state-router', './app-state', './class-diagram', './resource', './perspectives'
], function(webix, stateRouter, appState, classDiagram, resource, perspectives) {
  return function(initialState, defaultState) {
    defaultState = defaultState || initialState;
    webix.ready(function() {
      stateRouter.addState(appState);
      stateRouter.addState(classDiagram);
      stateRouter.addState(resource);
      stateRouter.addState(perspectives);
      stateRouter.on('routeNotFound', function(route, parameters) {
        console.log('route not found', route, defaultState);
        stateRouter.go(defaultState, { route: route });
      });
      stateRouter.evaluateCurrentRoute(initialState);
    });
  };
});
