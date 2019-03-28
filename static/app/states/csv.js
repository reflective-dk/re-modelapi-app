define([
    'webix', 'common/$$', '../models/basekit'
], function(webix, $$, basekit) {
    var templateId = webix.uid().toString();
    return {
        name: 'csv',
        route: '/csv',
        template: {
            $ui: { id: templateId, view: 'template' }
        },
        querystringParameters: [ 'perspective' ],
        activate: function(context) {
            console.log(context);
            return basekit.fetchPerspective(context.parameters.perspective, true)
                .then(function(csv) {
                    $$(templateId).setHTML(csv);
                })
                .catch(console.log);
        }
    };
});
