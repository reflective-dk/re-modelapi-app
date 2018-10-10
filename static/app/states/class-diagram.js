define([
    'webix', 'common/$$', '../models/situ', 'mermaid'
], function(webix, $$, situ, mermaid) {
    var ids = {
        label: 'class-diagram-label',
        diagram: 'class-diagram'
    };

    var ui = {
        rows: [
            { view: 'label', id: ids.label, height: 80, align: 'center', label: '' },
            { view: 'template', id: ids.diagram, css: { overflow: 'auto' }, template: '' }
        ]
    };

    return {
        name: 'app.classDiagram',
        route: '/class-diagram',
        template: {
            $ui: ui
        },
        activate: function(context) {
            var modelId = context.parameters['model-id'];
            if (!modelId) {
                // TODO: Go to different state
                return;
            }
            var label = $$(ids.label);
            var diagram = $$(ids.diagram);
            situ.generateDiagram(modelId)
                .then(function(def) {
                    label.define({ label: '<h2>Class diagram for \'' + modelId + '\' model' });
                    label.refresh();
                    diagram.define({ template: '<div class="mermaid">' + def + '</div>' });
                    diagram.refresh();
                    mermaid.init();
                })
                .fail(function(reason) {
                    console.log(reason);
                    label.define({ label: '<h2>Class diagram not available for \'' + modelId + '\' model' });
                    label.refresh();
                    diagram.define({ template: '' });
                    diagram.refresh();
                });
        }
    };
});
