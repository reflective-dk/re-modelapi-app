define([
    'webix', './state-router', './app-state', './class-diagram', './resource', './perspectives', './csv'
], function(webix, stateRouter, appState, classDiagram, resource, perspectives, csv) {
  return function(initialState, defaultState) {
    defaultState = defaultState || initialState;
    webix.ready(function() {
      stateRouter.addState(appState);
      stateRouter.addState(classDiagram);
      stateRouter.addState(resource);
      stateRouter.addState(perspectives);
      stateRouter.addState(csv);
      stateRouter.on('routeNotFound', function(route, parameters) {
        console.log('route not found', route, defaultState);
        stateRouter.go(defaultState, { route: route });
      });
      stateRouter.evaluateCurrentRoute(initialState);
    });
  };
});
