define([
    'webix', 'common/$$', '../models/situ', 'mermaid', 'panzoom', 'jquery', 'nomnoml', 'diagram'
], function(webix, $$, situ, mermaid, panzoom, jquery, nomnoml, Diagram) {
    var ids = {
        open: 'class-diagram-open',
        diagram: 'class-diagram'
    };

    var ui = {
        rows: [
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
            var diagram = $$(ids.diagram);
            if (modelId === 'camunda') {
               return situ.getCamundaTables()
                .then(function (result) {
                  let sources = Diagram.tablesToNONOML({
                    tables: result
                  });
                  
                  diagram.define({ template: '<div id="diagram"><canvas id="relatedClasses"></canvas><canvas id="unrelatedClasses"></canvas></div>' });
                  diagram.refresh();
                  
                  var relatedClassesCanvas = document.getElementById('relatedClasses');
                  var unrelatedClassesCanvas = document.getElementById('unrelatedClasses');
                  
                  nomnoml.draw(relatedClassesCanvas, sources.relatedClassesSource);
                  nomnoml.draw(unrelatedClassesCanvas, sources.unrelatedClassesSource);
                  
                  jquery('#diagram').panzoom();
                  document.getElementById('diagram').addEventListener('wheel', function () {
                    jquery('#diagram').panzoom("zoom", event.deltaY < 0);
                  });
                });
            } else {
                situ.generateDiagram(modelId)
                    .then(function(def) {
                        if (def.length < 1000) {
                            //small diagram, reduce canvas
                            diagram.define({ template: '<div id="diagram" class="mermaid" style="width:300px;margin: 0 auto;">' + def + '</div>' });
                        } else {
                            diagram.define({ template: '<div id="diagram" class="mermaid">' + def + '</div>' });
                        }
                        diagram.refresh();
                        jquery('#diagram').panzoom();
                        document.getElementById('diagram').addEventListener('wheel', function () {
                          jquery('#diagram').panzoom("zoom", event.deltaY < 0);
                        });
                        mermaid.init();
                    })
                    .fail(function(reason) {
                        console.error(reason);
                        diagram.define({ template: '<h2>Class diagram not available for \'' + modelId + '\' model</h2>' });
                        diagram.refresh();
                    });
            }
        }
    };
});
