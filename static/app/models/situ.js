define([
    'webix', './basekit', 'common/promise', 'common/models'
], function(webix, basekit, promise, models) {
    return {
        fetchResource: fetchResource,
        generateDiagram: generateDiagram,
        getCamundaTables: getCamundaTables,
        fetchPerspective: fetchPerspective
    };

    function fetchResource(path) {
        return basekit.fetchResource(path)
            .catch(function(reason) { return reason.response; });
    }

    function fetchPerspective(perspective, asCsv) {
        return basekit.fetchPerspective(perspective, asCsv)
            .then(function(rows) {
                var columns = {};
                rows.forEach(function(row) {
                    Object.keys(row).forEach(function(key) {
                        columns[key] = true;
                    });
                });
                return {
                    columnNames: columnNames(columns),
                    rows: rows
                };
            })
            .catch(function(reason) { return reason.response; });
    }

    function columnNames(columns) {
        var doLast = [ 'Bruger', 'Email' ];
        var last = [];
        var activeFromTo = [];
        var columnNames = Object.keys(columns).filter(function(col) {
            switch (true) {
            case doLast.some(function(prefix) { return !!col.match('^' + prefix); }):
                last.push(col);
            case col === 'AktivFra':
            case col === 'AktivTil':
                return activeFromTo = [ 'AktivFra', 'AktivTil' ];
            default:
                return true;
            }
        });
        return columnNames.concat(last.sort(), activeFromTo);
    }

    function getCamundaTables() {
      return basekit.query({
          relatesTo: {
              class: "e99d7f86-739c-40e7-953b-d73869572066"
          }
      });
    }
    function generateDiagram(modelId) {
        return fetchResource(modelId)
            .then(function(conf) {
                var classIds = Object.keys(conf.types).map(function(k) {
                    return { id: conf.types[k].classId };
                });
                return basekit.snapshot(classIds);
            })
            .then(function(classes) {
                var lines = [];
                classes.forEach(function(cls) { pushLinesForClass(cls, lines); });
                if (!lines.length) {
                    return promise.reject('no classes for model id: ' + modelId);
                }
                lines.unshift('classDiagram');
                return lines.join('\n');
            });
    }

    function pushLinesForClass(cls, lines) {
        var name = cls.snapshot.name;
        var labelsets = {};
        if (cls.snapshot.extends) {
            lines.push(cls.snapshot.extends.name + ' <|-- ' + name);
        }
        var relations = cls.snapshot.singleRelations || {};
        relations = Object.assign(relations, cls.snapshot.manyRelations || {});
        Object.keys(relations)
            .forEach(function(k) {
                var target = relations[k];
                (labelsets[target.name] = labelsets[target.name] || []).push(k);
            });
        Object.keys(labelsets).forEach(function(targetName) {
            lines.push(targetName + ' <-- ' + name + label(targetName, labelsets[targetName]));
        });
        var attributes = cls.snapshot.attributes || {};
        Object.keys(attributes)
            .forEach(function(k) {
                var attribute = attributes[k];
                var dataType = (typeof attribute.dataType === 'string') ? attribute.dataType : attribute.dataType.type;
                lines.push(name + ' : ' + dataType.replace(/json/, 'string') + ' ' + k);
            });
        var collections = cls.snapshot.collections || {};
        Object.keys(collections)
            .forEach(function(k) {
                var collection = collections[k];
                var dataType = (typeof collection.dataType === 'string') ? collection.dataType : collection.dataType.type;
                dataType +=  '[]';
                lines.push(name + ' : ' + dataType.replace(/json/, 'string') + ' ' + k);
            });
    }

    function label(targetName, labels) {
        var tn = targetName.replace(/ /g, '').toLowerCase();
        var label = labels.join(', ');
        return tn === label.toLowerCase() ? '' : ' : ' + label;
    }
});
