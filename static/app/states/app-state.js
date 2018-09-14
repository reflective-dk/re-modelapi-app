define([
    'webix', 'common/$$', 'common/helpers', './state-router', '../models/basekit'
], function(webix, $$, helpers, stateRouter, basekit) {

    var ui = {
        rows: [
            { view: 'toolbar',
              id: 'toolbar',
              hidden: true,
              cols: [
                  {},
                  { id: 'session', type: 'header', borderless: true, template: '<span class="webix_icon icon fa-user-circle-o big_icon"></span><span class="user">#username#</span>' },
              ] },
            { $subview: true }
        ]
    };

    return {
        name: 'app',
        route: '/app',
        template: {
            $ui: ui,
            $oninit: init
        },
        querystringParameters: [ 'id' ]
    };

    function init() {
        $$('session').parse({ username: basekit.username() });
	$$('toolbar').show();
    }
});
