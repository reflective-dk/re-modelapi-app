define([
    'webix', './basekit', 'common/promise', 'common/models'
], function(webix, basekit, promise, models) {
    return {
        fetchResource: fetchResource
    };

    function fetchResource(path) {
        console.log('about to fetch', path);
        return promise.resolve(42);
    }
});
