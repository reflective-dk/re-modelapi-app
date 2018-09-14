define([
    'webix', './basekit', 'common/promise', 'common/models'
], function(webix, basekit, promise, models) {
    return {
        fetchResource: fetchResource
    };

    function fetchResource(path) {
        return basekit.fetchResource(path)
            .catch(function(reason) { return reason.response; });
    }
});
