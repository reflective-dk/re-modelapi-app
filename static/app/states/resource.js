define([
    // Note: We deliberately load simple-json-viewer even though it's not used
    // directly in the code below
    'webix', 'common/$$', './state-router', '../models/situ', 'common/simple-json-viewer'
], function(webix, $$, stateRouter, situ, sjv) {
    var ids = {
        path: webix.uid().toString(),
        button: webix.uid().toString(),
        contents: webix.uid().toString()
    };
    var jsonViewer;

    return {
        name: 'app.resource',
        route: '/resource',
        template: {
            $ui: {
                rows: [
                    {
                      type: 'border-layout',
                      cols: [
                        {
                          width: 5
                        },
                        { id: ids.path,
                          view: 'text',
                          value: 'ro/units',
                          tooltip: 'Path to ressource',
                          width: 200
                        },
                        { id: ids.button,
                          view: 'icon',
                          type: 'icon',
                          icon: 'play',
                          tooltip: 'Get the ressources',
                          width: 30
                        },
                        {}
                    ] },
                    { view: 'template',
                      id: 'json-viewer-webix-view',
                      template: '<div id="json-viewer"></div>',
                    }
                ]
            },
            $oninit: init
        }
    };

    function init() {
        $$(ids.path).attachEvent('onEnter', fetchResource);
        $$(ids.button).attachEvent('onItemClick', fetchResource);
        // This allows for CSS styling of the container which is required to get scrolling
        $$('json-viewer-webix-view').getNode().setAttribute('id', 'json-viewer-container');
        jsonViewer = window.createJSONViewer(document.querySelector('#json-viewer'), []);
    }

    function fetchResource() {
        jsonViewer.changeJSON([]);
        return situ.fetchResource($$(ids.path).getValue())
            .then(function(resource) {
                jsonViewer.changeJSON(resource);
            });
    }
});
