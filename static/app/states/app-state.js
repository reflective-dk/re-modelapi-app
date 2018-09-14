define([
    'webix', 'common/$$', 'common/helpers', './state-router', '../models/basekit'
], function(webix, $$, helpers, stateRouter, basekit) {

    var ui = {
        rows: [
            { view: 'toolbar',
              id: 'toolbar',
              hidden: true,
              cols: [
                  { id: 'vt',
                    view: 'datepicker',
                    label: 'Visningstidspunkt:',
                    labelWidth: 140,
                    width: 280,
                    stringResult: true,
                    format: '%d-%m-%Y' },
                  { gravity: 2 },
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
        querystringParameters: [ 'id', 'validOn' ],
        activate: function(context) {
            var validOn = basekit.setValidOn(new Date(context.parameters.validOn));
            $$('vt').setValue(validOn);
        }
    };

    function init() {
        $$('vt').attachEvent('onChange', function(value) {
            var validOn = helpers.dumpTimeZone(value);
            stateRouter.go(null, // Go to same state with new validOn parameter
                           { validOn: validOn.toISOString().slice(0,10) },
                           { inherit: true });
        });
        $$('session').parse({ username: basekit.username() });
	$$('toolbar').show();
    }
});
