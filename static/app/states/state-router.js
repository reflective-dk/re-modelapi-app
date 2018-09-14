define([
    'webix', 'common/webix-state-renderer', 'common/abstract-state-router'
], function (webix, webixStateRenderer, abstractStateRouter) {
    var renderer = webixStateRenderer(webix);
    return abstractStateRouter(renderer, this.document.body);
});
