define([
    'webix', 'common/promise', 'common/$$', './state-router', '../models/situ',
    'common/lodash'
], function(webix, promise, $$, stateRouter, situ, _) {
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
    var activationFilter = 'active-and-future';

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
                          } }
                    ] },
                    { cols: [
                        {},
		        { view: 'button', id: ids.button, label: 'Hent CSV',
                          type: 'form', height: 50, width: 100 }
                    ] }
                ]
            },
            $oninit: init
        },
        activate: function(context) {
            var newActivationFilter = context.parameters['activation-filter'] || activationFilter;
            if (activationFilter != newActivationFilter) {
                activationFilter = newActivationFilter;
                // Clear promise collection to force re-retrieval from the server
                contentPromises = {};
                var tableId = $$(ids.tabview).getValue();
                var perspective = _.find(Object.keys(ids), function(p) {
                    return ids[p] === tableId;
                });
                updateTable(perspective, ids[perspective]);
            }
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
            var perspective = _.find(Object.keys(ids), function(p) {
                return ids[p] === tableId;
            });
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
                table.clearAll();
                table.showProgress();
                return situ.fetchPerspective(perspective, activationFilter);
            })
            .then(function(rowsAndCols) {
                if (!rowsAndCols.columnNames) {
                    console.log('perspective \'' + perspective + '\' not available on server');
                    return;
                }
                var filtered = rowsAndCols.columnNames
                    .filter(function(key) {
                        // Leave out all id columns except 'EksterntId' columns
                        return !/id$/i.test(key) || /eksterntid$/i.test(key);
                    });
                table.config.columns = filtered
                    .map(function(key) { return {
                        id: key,
                        header: key,
                        sort: /^Antal/.test(key) ? 'int'
                            : /(Fra|Til)$/.test(key) ? compareDanishDates(key) : 'string',
                        fillspace: filtered.length <= 12
                    }; });
                table.refreshColumns();
                table.define('data', rowsAndCols.rows);
            }).then(function() {
                table.hideProgress();
                if (table.getFirstId()) {
                  table.select(table.getFirstId());
                }
            });

        return contentsAsPromised.then(function() {
            webix.UIManager.setFocus(table);
        });
    }

    function compareDanishDates(key) {
        return function(a, b) {
            // Danish dates are backwards
            var aParts = /^(\d+)-(\d+)-(\d+)$/.exec(a[key]) || [];
            var bParts = /^(\d+)-(\d+)-(\d+)$/.exec(b[key]) || [];
            var aa = aParts.slice(1).reverse().join('-');
            var bb = bParts.slice(1).reverse().join('-');
            return aa > bb ? 1 : (aa < bb ? -1 : 0);
        };
    }
});
