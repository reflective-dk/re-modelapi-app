define([
    'webix', 'common/$$', '../models/basekit'
], function(webix, $$, basekit) {
    var areaId = webix.uid().toString();
    return {
        name: 'csv',
        route: '/csv',
        template: {
            $ui: { id: areaId, view: 'textarea' }
        },
        querystringParameters: [ 'perspective' ],
        activate: function(context) {
            console.log(context);
            return basekit.fetchPerspective(context.parameters.perspective, true)
                .then(function(csv) {
                    $$(areaId).setValue(csv);
                })
                .catch(console.log);
        }
    };
});
