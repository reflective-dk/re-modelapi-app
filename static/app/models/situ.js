define([
    'webix', './basekit', 'common/promise', 'common/models'
], function(webix, basekit, promise, models) {
    return {
        fetchResource: fetchResource,
        generateDiagram: generateDiagram
    };

    function fetchResource(path) {
        return basekit.fetchResource(path)
            .catch(function(reason) { return reason.response; });
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
        var props = cls.snapshot.properties || {};
        Object.keys(props)
            .filter(function(k) { return props[k].dataType.type === 'relation'; })
            .forEach(function(k) {
                var target = props[k].dataType.target;
                (labelsets[target.name] = labelsets[target.name] || []).push(k);
            });
        Object.keys(labelsets).forEach(function(targetName) {
            lines.push(targetName + ' <-- ' + name + label(targetName, labelsets[targetName]));
        });
        Object.keys(props)
            .filter(function(k) { return props[k].dataType.type !== 'relation'; })
            .forEach(function(k) {
                var prop = props[k];
                var dataType = (typeof prop.dataType === 'string') ? prop.dataType : prop.dataType.type;
                dataType += prop.type === 'simple' ? '' : '[]';
                lines.push(name + ' : ' + dataType.replace(/json/, 'string') + ' ' + k);
            });
    }

    function label(targetName, labels) {
        var tn = targetName.replace(/ /g, '').toLowerCase();
        var label = labels.join(', ');
        return tn === label.toLowerCase() ? '' : ' : ' + label;
    }
});
