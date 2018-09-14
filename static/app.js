requirejs.config({
    baseUrl: 'static/lib',
    paths: {
        common: '../../common/lib',
        app: '../app',
        // webix: '//cdn.webix.com/5.4/webix'
        webix: '../../common/js/webix'
    },
    shim: {
        webix: {
            exports: 'webix'
        }
    }
});

requirejs([ '../../static/app/main' ]);
