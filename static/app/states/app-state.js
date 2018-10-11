define([
    'webix', 'common/promise', 'common/$$', 'common/helpers', './state-router',
    '../models/basekit', '../models/situ', '../views/model-menu',
    'commonViews/nav-menu', 'commonViews/logout-button'
], function(webix, promise, $$, helpers, stateRouter, basekit, situ,
            ModelMenu, NavMenu, LogoutButton) {
    var modelMenu = new ModelMenu({
        getConfig: function() {
            // TODO: get config with call from service
            return promise.resolve({ ro: 'ro', aau: 'aau' });
        }
    });

    var navMenu = new NavMenu();
    var logoutButton = new LogoutButton({ callback: '/app/modelapi/' });

    var ui = {
        rows: [
            { view: 'toolbar',
              id: 'toolbar',
              hidden: true,
              cols: [
                  navMenu.ui,
                  { type: 'header',
	            template: 'Reflective Model API Explorer',
                    width: 300,
	            borderless: true
	          },
                  { id: 'vt',
                    view: 'datepicker',
                    tooltip: 'Visningstidspunkt',
                    width: 200,
                    stringResult: true,
                    format: '%d-%m-%Y'
                  },
                  { gravity: 2 },
                  { view: 'icon',
                    icon: 'user',
                    id: 'user-menu',
                    borderless: true
                  },
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
                    if (context.parameters['model-id'] && modelIds.indexOf(context.parameters['model-id']) == -1) {
                        console.log('redirecting to explorer');
                        stateRouter.go('app.resource',
                                       { 'valid-on': validOn.toISOString().slice(0,10) });
                    } else {
                        modelMenu.selectMenuItem(context.parameters['model-id']);
                        webix.UIManager.setFocus($$(modelMenu.ids.menu));
                    }
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
        $$('user-menu').define({ tooltip: basekit.username() });
	$$('toolbar').show();
        navMenu.onInit($$('toolbar').$height);
    }
});
