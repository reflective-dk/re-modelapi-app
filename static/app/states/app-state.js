define([
    'webix', 'common/promise', 'common/$$', 'common/helpers', './state-router',
    '../models/basekit', '../models/situ', '../views/model-menu',
    'commonViews/nav-menu', 'commonViews/logout-button'
], function(webix, promise, $$, helpers, stateRouter, basekit, situ,
            ModelMenu, NavMenu, LogoutButton) {
    var modelMenu = new ModelMenu({
        getConfig: function() {
            // TODO: get config with call from service
            let models = { ro: 'ro', mariadb: 'mariadb', camunda: 'camunda' };
            if (basekit.client.context.domain === 'aau') {
                models.aau = 'aau';
            }
            return promise.resolve(models);
        }
    });

    var navMenu = new NavMenu();
    var logoutButton = new LogoutButton({ username: basekit.username(), callback: '/app/modelapi/' });

    var ui = {
        rows: [
            { view: 'toolbar',
              id: 'toolbar',
              hidden: true,
              cols: [
                  navMenu.ui,
                  { 
                    width: 160
	              },
                  { id: 'vt',
                    view: 'datepicker',
                    tooltip: 'Visningstidspunkt',
                    width: 120,
                    stringResult: true,
                    format: '%d-%m-%Y'
                  },
                  { gravity: 2 },
                  logoutButton.ui
              ]
            },
            { cols: [
                modelMenu.ui,
                { $subview: true }
            ]}
        ]
    };

    return {
        name: 'app',
        route: '/app',
        template: {
            $ui: ui,
            $menu: modelMenu.ids.menu,
            $oninit: init
        },
        querystringParameters: [ 'model-id', 'valid-on' ],
        activate: function(context) {
            var validOn = basekit.setValidOn(new Date(context.parameters['valid-on']));
            $$('vt').setValue(validOn);
            modelMenu.onInit(validOn)
                .then(function(modelIds) {
                    var modelId = context.parameters['model-id'];
                    if (modelId && modelIds.indexOf(modelId) > -1) {
                        modelMenu.selectMenuItem(modelId);
                        webix.UIManager.setFocus($$(modelMenu.ids.menu));
                        return;
                    }
                    if (stateRouter.stateIsActive('app.resource')) {
                        $$(modelMenu.ids.menu).select(modelMenu.ids.explorer);
                        webix.UIManager.setFocus($$(modelMenu.ids.menu));
                        return;
                    }
                    if (stateRouter.stateIsActive('app.perspectives')) {
                        $$(modelMenu.ids.menu).select(modelMenu.ids.perspectives);
                        webix.UIManager.setFocus($$(modelMenu.ids.menu));
                        return;
                    }
                    console.log('redirecting to explorer');
                    stateRouter.go('app.resource',
                                   { 'valid-on': validOn.toISOString().slice(0,10) });
                })
                .fail(console.log);
        }
    };

    function init() {
        $$('vt').attachEvent('onChange', function(validOn) {
            validOn.setHours(23, 59, 59, 999);
            stateRouter.go(null, // Go to same state with new valid-on parameter
                           { 'valid-on': validOn.toISOString().slice(0,10) },
                           { inherit: true });
        });
    	$$('toolbar').show();
        navMenu.onInit($$('toolbar').$height);
    }
});
