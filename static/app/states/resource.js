define([
    'webix', 'common/$$', './state-router', '../models/situ'
], function(webix, $$, stateRouter, situ) {
    var ids = {
        path: webix.uid().toString(),
        button: webix.uid().toString(),
        contents: webix.uid().toString()
    };
    return {
        name: 'app.resource',
        route: '/resource',
        template: {
            $ui: {
                rows: [
                    { cols: [
                        {},
                        { id: ids.path,
                          view: 'text',
                          value: 'ro/units', label: 'Sti' },
                        { id: ids.button,
                          view: 'button',
                          value: 'Hent',
                          inputWidth: 100 },
                        {}
                    ] },
                    { id: ids.contents,
                      view: 'textarea' }
                ]
            },
            $oninit: init
        }
    };

    function init() {
        $$(ids.path).attachEvent('onEnter', fetchResource);
        $$(ids.button).attachEvent('onItemClick', fetchResource);
    }

    function fetchResource() {
        var contents = $$(ids.contents);
        contents.setValue('');
        return situ.fetchResource($$(ids.path).getValue())
            .then(function(resource) {
                contents.setValue(JSON.stringify(resource, null, 2));
            });
    }
});
