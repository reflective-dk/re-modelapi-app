define([
    'webix', 'common/$$', './state-router', '../models/situ'
], function(webix, $$, stateRouter, situ) {
    var ids = {
        button: webix.uid().toString(),
        unitTable: webix.uid().toString(),
        employeeTable: webix.uid().toString(),
        roleAssignmentTable: webix.uid().toString(),
        userAccountTable: webix.uid().toString(),
        locationTable: webix.uid().toString()
    };

    return {
        name: 'app.perspectives',
        route: '/perspectives',
        template: {
            $ui: {
                rows: [
                    { view: 'tabview', cells: [
                        { id: 'units', header: 'Enheder',
                          body: {
                              id: ids.unitTable,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'employees', header: 'Medarbejdere',
                          body: {
                              id: ids.employeeTable,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'role-assignments', header: 'Rolletildelinger',
                          body: {
                              id: ids.roleAssignmentTable,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'user-accounts', header: 'Brugere',
                          body: {
                              id: ids.userAccountTable,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                        { id: 'locations', header: 'Lokationer',
                          body: {
                              id: ids.locationTable,
                              view: 'datatable',
                              resizeColumn: true
                          } },
                    ] },
                    { cols: [
                        {},
                        { id: ids.button,
                          view: 'button',
                          value: 'Hent',
                          inputWidth: 100 },
                    ] }
                ]
            },
            $oninit: init
        }
    };

    function init() {
        initTable('units', ids.unitTable);
        initTable('employees', ids.employeeTable);
        initTable('role-assignments', ids.roleAssignmentTable);
        initTable('user-accounts', ids.userAccountTable);
        initTable('locations', ids.locationTable);
    }

    function initTable(perspective, tableId) {
        var table = $$(tableId);
        webix.extend(table, webix.ProgressBar);
        table.attachEvent('onViewShow', function() {
            if (table.getFirstId()) {
                console.log('first id', table.getFirstId());
                return;
            }
            table.showProgress();
            situ.fetchPerspective(perspective).then(function(rowsAndCols) {
                table.config.columns = rowsAndCols.columns;
                table.refreshColumns();
                table.define('data', rowsAndCols.rows);
                table.hideProgress();
            });
        });
    }
});
