define([
    'webix', 'common/promise', 'common/$$', 'common/models'
], function(webix, promise, $$, models) {
    return function(options) {
        var self = this;
        var explorerId = webix.uid().toString();
        this.ids = {
            menu: webix.uid().toString()
        };
        this.modelIds = {};
        this.ui = {
            type: 'clean',
            css: 'app-left-panel',
            padding: 10,
            margin: 20,
            borderless: true,
            rows: [ {
                view: 'menu',
                id: this.ids.menu,
                width: 200,
                layout: 'y',
                select: true,
                template:'<span class="webix_icon fa-#icon#"></span> #value# ',
                data: [ ]
            } ]
        };

        var initCompleted;

        this.onInit = function(validOn) {
            initCompleted = initCompleted || promise.defer();
            var menu = $$(self.ids.menu);
            menu.clearAll();
            self.modelIds = {};
            return options.getConfig()
                .then(function(config) {
                    var suffix = 'valid-on=' + validOn.toISOString().slice(0,10);
                    menu.clearAll();
                    Object.keys(config).forEach(function(modelId) {
                        self.modelIds[modelId] = webix.uid().toString();
                        menu.add({
                            value: modelId,
                            id: self.modelIds[modelId],
                            href: '#/app/class-diagram?' + 'model-id=' + modelId + '&' + suffix,
                            icon: 'sitemap'
                        });
                    });
                    menu.sort('value');
                    menu.add({
                        value: 'API-udforsker',
                        id: explorerId,
                        // Cannot refer to child state in parent template (stateRouter.makePath())
                        href: '#/app/resource?' + suffix,
                        icon: 'home'
                    }, 0);
                    initCompleted.resolve(true);
                    return Object.keys(self.modelIds);
                });
        };

        this.selectMenuItem = function(modelId) {
            initCompleted = initCompleted || promise.reject(false);
            var menu = $$(self.ids.menu);
            initCompleted.then(function() {
                var itemId = self.modelIds[modelId] || explorerId;
                if (itemId) {
                    menu.select(itemId);
                }
            });
        };
    };
});
