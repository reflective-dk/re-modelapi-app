requirejs.config({
    urlArgs: 'build=$BUILD_NUM$',
    baseUrl: 'static/lib',
    paths: {
        common: '../../common/lib',
        commonViews: '../../common/views',
        dagre: '../js/dagre.min',
        app: '../app',
        mermaid: '../shims/expose-mermaid',
        nomnoml: '../js/nomnoml',
        webix: '../../common/js/webix',
        axios: '../../common/js/axios',
        jquery: '../js/jquery',
        panzoom: '../js/jquery.panzoom.min'
    },
    shim: {
        webix: {
            exports: 'webix'
        },
        mermaid: {
            exports: 'mermaid'
        },
        nomnoml: {
          exports: 'nomnoml',
          deps: ['dagre']
        }
    }
});

requirejs([ '../../static/app/main' ]);

requirejs(['dagre'], (dagre) => {
  window.dagre = dagre;
});