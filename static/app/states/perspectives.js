define([
    'webix', 'common/promise', 'common/$$', './state-router', '../models/situ'
], function(webix, promise, $$, stateRouter, situ) {
    var ids = {
        button: webix.uid().toString(),
        tabview: webix.uid().toString(),
        units: webix.uid().toString(),
        employees: webix.uid().toString(),
        'role-assignments': webix.uid().toString(),
        'user-accounts': webix.uid().toString(),
        rights: webix.uid().toString(),
        locations: webix.uid().toString()
    };

    var contentPromises = {};

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
                              select: 'row',
                              resizeColumn: true
                          } },
                        { id: 'employees', header: 'Medarbejdere',
                          body: {
                              id: ids.employees,
                              view: 'datatable',
                              select: 'row',
                              resizeColumn: true
                          } },
                        { id: 'role-assignments', header: 'Rolletildelinger',
                          body: {
                              id: ids['role-assignments'],
                              view: 'datatable',
                              select: 'row',
                              resizeColumn: true
                          } },
                        { id: 'user-accounts', header: 'Brugere',
                          body: {
                              id: ids['user-accounts'],
                              view: 'datatable',
                              select: 'row',
                              resizeColumn: true
                          } },
                        { id: 'rights', header: 'Rettigheder',
                          body: {
                              id: ids.rights,
                              view: 'datatable',
                              select: 'row',
                              resizeColumn: true
                          } },
                        { id: 'locations', header: 'Lokationer',
                          body: {
                              id: ids.locations,
                              view: 'datatable',
                              select: 'row',
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
        updateTable('units', ids.units);
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
                    template: function(row) {
                        var val = row[column.id];
                        return val ? '"' + val + '"' : '';
                    }
                };
            });
            webix.csv.delimiter.cols = ';';
            webix.csv.escape = false;
            webix.toCSV(table, { filename: perspective, columns: columns });
        });
    }

    function initTable(perspective, tableId) {
        var table = $$(tableId);
        webix.extend(table, webix.ProgressBar);
        table.attachEvent('onViewShow', function() {
            updateTable(perspective, tableId);
        });
    }

    function updateTable(perspective, tableId) {
        var table = $$(tableId);
        var contentsAsPromised = contentPromises[tableId] = contentPromises[tableId] ||
            promise.resolve()
            .then(function() {
                table.showProgress();
                return situ.fetchPerspective(perspective);
            })
            .then(function(rowsAndCols) {
                if (!rowsAndCols.columnNames) {
                    console.log('perspective \'' + perspective + '\' not available on server');
                    return;
                }
                table.config.columns = rowsAndCols.columnNames
                // Leave out all id columns except 'EnhedEksterntId'
                    .filter(function(key) { return key === 'EnhedEksterntId' || !/id$/i.test(key); })
                    .map(function(key) { return {
                        id: key,
                        header: key,
                        sort: /^Antal/.test(key) ? 'int' : 'string',
                        fillspace: true
                    }; });
                table.refreshColumns();
                table.define('data', rowsAndCols.rows);
            }).then(function() {
                table.hideProgress();
                table.select(table.getFirstId());
            });

        return contentsAsPromised.then(function() {
            webix.UIManager.setFocus(table);
        });
    }
});
