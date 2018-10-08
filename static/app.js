requirejs.config({
    baseUrl: 'static/lib',
    paths: {
        common: '../../common/lib',
        commonViews: '../../common/views',
        app: '../app',
        // webix: '//cdn.webix.com/5.4/webix'
        mermaid: '../shims/expose-mermaid',
        webix: '../../common/js/webix'
    },
    shim: {
        webix: {
            exports: 'webix'
        },
        mermaid: {
            exports: 'mermaid'
        }
    }
});

requirejs([ '../../static/app/main' ]);
