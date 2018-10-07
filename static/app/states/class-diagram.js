define([
    'webix'
], function(webix) {
    return {
        name: 'app.classDiagram',
        route: '/class-diagram',
        template: {
            $ui: {
                css: 'content-panel-background',
                rows: [
                    {
                        template: 'Class diagram'
                    }
                ]
            }
        }
    };
});
