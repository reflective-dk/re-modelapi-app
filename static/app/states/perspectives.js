define([
    'webix', 'common/$$', './state-router', '../models/situ'
], function(webix, $$, stateRouter, situ) {
    var ids = {
        button: webix.uid().toString(),
        tabview: webix.uid().toString(),
        units: webix.uid().toString(),
        employees: webix.uid().toString(),
        'role-assignments': webix.uid().toString(),
        'user-accounts': webix.uid().toString(),
        locations: webix.uid().toString()
    };

    var promises = {};

    return {
        name: 'app.perspectives',
        route: '/perspectives',
        template: {
            $ui: {
                rows: [
                    { id: ids.tabview,
                      view: 'tabview', cells: [
                        { id: 'units', header: 'Enheder',
                          body: {
                              id: ids.units,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'employees', header: 'Medarbejdere',
                          body: {
                              id: ids.employees,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'role-assignments', header: 'Rolletildelinger',
                          body: {
                              id: ids['role-assignments'],
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'user-accounts', header: 'Brugere',
                          body: {
                              id: ids['user-accounts'],
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'locations', header: 'Lokationer',
                          body: {
                              id: ids.locations,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                    ] },
                    { cols: [
                        {},
		        { view: 'button', id: ids.button, label: 'Hent CSV',
                          type: 'form', height: 50, width: 100 }
                    ] }
                ]
            },
            $oninit: init
        }
    };

    function init() {
        Object.keys(ids).forEach(function(perspective) {
            initTable(perspective, ids[perspective]);
        });
        fetchContents('units', ids.units);
        $$(ids.button).attachEvent('onItemClick', function() {
            var tableId = $$(ids.tabview).getValue();
            var table = $$(tableId);
            var perspective = Object.keys(ids).filter(function(p) {
                return ids[p] === tableId;
            })[0];
            var columns = table.config.columns.map(function(column) {
                return {
                    id: column.id,
                    header: column.header,
                    template: webix.template('"#' + column.id + '#"')
                };
            });
            webix.csv.delimiter.cols = ';';
            webix.toCSV(table, { filename: perspective, columns: columns });
        });
    }

    function initTable(perspective, tableId) {
        var table = $$(tableId);
        webix.extend(table, webix.ProgressBar);
        table.attachEvent('onViewShow', function() { fetchContents(perspective, tableId); });
    }

    function fetchContents(perspective, tableId) {
        var table = $$(tableId);
        var promise = promises[tableId] = promises[tableId] || situ.fetchPerspective(perspective);
        if (table.getFirstId()) {
            return;
        }
        table.showProgress();
        promise.then(function(rowsAndCols) {
            table.config.columns = rowsAndCols.columnNames
                .filter(function(key) { return !/id$/i.test(key); })
                .map(function(key) { return { id: key, header: key, sort: 'string' }; });
            table.refreshColumns();
            table.define('data', rowsAndCols.rows);
            table.hideProgress();
        });
    }
});
