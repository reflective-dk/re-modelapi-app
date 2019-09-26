define([ 'common/lodash.get' ], function (lodashGet) {

  return {
    tablesToNONOML: function (args) {
      var classes = {}, relations = '';
      
      args.tables.forEach((table) => {
        let attributes = [];
        
        Object.keys(lodashGet(table, 'snapshot.columns', [])).forEach(function (columnKey) {
          let column = table.snapshot.columns[columnKey];
          let typeText = column.type.datatype;
          if (column.type.length) {
            typeText += '(' + column.type.length + ')';
          }
          attributes.push(column.name + ': ' + typeText);
          let classStr = "[" + table.snapshot.name + "|" + attributes.join('; ') + " ]\n";
          classes[table.snapshot.name] = {
            line: classStr,
            relations: []
          };
        });
        
      });
      args.tables.forEach((table) => {
        Object.keys(lodashGet(table, 'snapshot.columns', [])).forEach(function (columnKey) {
          let foreignKeys = Object.keys(lodashGet(table, 'snapshot.foreignKeys', {}));
          foreignKeys.forEach(function (foreignKey) {
            let foreignTable = table.snapshot.foreignKeys[foreignKey].reference.table;
            if (foreignTable !== table.snapshot.name) {
              let relation = "[" + table.snapshot.name + "]- 0..*[" + foreignTable + "]\n";
              relations += relation;
              classes[table.snapshot.name].relations.push(relation);
              classes[foreignTable].relations.push(relation);
            }
          });
        });
      });
      
      let classesArr = [], unrelatedClassesArr = [];
      Object.keys(classes).forEach(function (classKey) {
        if (classes[classKey].relations.length > 0) {
          classesArr.push(classes[classKey]);
        } else {
          unrelatedClassesArr.push(classes[classKey]);
        }
      });
      classesArr.sort(function (a, b) {
        if (a.relations.length > b.relations.length) {
          return -1;
        } else if (a.relations.length < b.relations.length) {
          return 1;
        } else {
          return 0;
        }
      });
      let classesStr = '', unrelatedClassesStr = '';
      classesArr.forEach(function (classObject) {
        classesStr += classObject.line;
      });
      unrelatedClassesArr.forEach(function (classObject) {
        unrelatedClassesStr += classObject.line;
      });
      return {
        relatedClassesSource: classesStr + relations,
        unrelatedClassesSource: unrelatedClassesStr
      };
    },
    tablesToUML: function (args) {
      var graph = new joint.dia.Graph();
      let element = $('#' + args.diagramId);
      
      let paper = new joint.dia.Paper({
          el: element,
          height: element.height(),
          width: element.width(),
          gridSize: 1,
          model: graph
      });
      
      var uml = joint.shapes.uml;
      
      let classes = {}, relations = {};

      args.tables.forEach((table) => {
        let attributes = [];
        
        Object.keys(lodashGet(table, 'snapshot.columns', [])).forEach(function (columnKey) {
          let column = table.snapshot.columns[columnKey];
          let typeText = column.type.datatype;
          if (column.type.length) {
            typeText += typeText + '(' + column.type.length + ')';
          }
          attributes.push(column.name + ' ' + typeText);
        });
        
        let umlClass = new uml.Class({
              //position: { x:20  , y: 190 },
              size: { width: 320, height: attributes.length * 16 + 50 },
              name: table.snapshot.name,
              attributes: attributes,
              attrs: {
                  '.uml-class-name-rect': {
                      fill: '#ff8450',
                      stroke: '#fff',
                      'stroke-width': 0.5,
                  },
                  '.uml-class-attrs-rect': {
                      fill: '#fe976a',
                      stroke: '#fff',
                      'stroke-width': 0.5
                  },
                  '.uml-class-attrs-text': {
                      ref: '.uml-class-attrs-rect',
                      'y-alignment': 'top',
                      'font-size': 14
                  },
                  '.uml-class-methods-rect': {
                      visibility: 'hidden'
                  }
              }
          });
          classes[table.snapshot.name] = umlClass;
      });
      
      args.tables.forEach((table) => {
        Object.keys(lodashGet(table, 'snapshot.columns', [])).forEach(function (columnKey) {
          Object.keys(lodashGet(table, 'snapshot.foreignKeys', {}))
          .forEach(function (foreignKey) {
            let foreignTable = table.snapshot.foreignKeys[foreignKey].reference.table;
            let relation = new uml.Association({ source: { id: classes[table.snapshot.name].id }, target: { id: classes[foreignTable].id }});
            relations[classes[table.snapshot.name].id + classes[foreignTable].id] = relation;
          });
        });
      });
      
      let classCells = [], relationCells = [];
      Object.keys(classes).forEach(function(key) {
          classCells.push(classes[key]);
      });
      
      /*
          new uml.Multiplicity({ source: { id: classes.man.id }, target: { id: classes.person.id }}),
          new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id }}),
          new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id }}),
          new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id }}),
          new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id }})
      ];*/
      
      Object.keys(relations).forEach(function(key) {
          relationCells.push(relations[key]);
      });
      graph.resetCells(classCells);
      //paper.freeze();
      var graphBBox = joint.layout.DirectedGraph.layout(graph, {
    rankDir: 'LR',
    marginX: 30,
    marginY: 30,
    clusterPadding: {
        top: 30,
        left: 10,
        right: 10,
        bottom: 10
    }
      });
      graph.addCells(relationCells);
      /*paper.fitToContent({
          padding: 0,
          allowNewOrigin: 'any',
          useModelGeometry: true
      });*/
      //paper.unfreeze();
      return args.tables;
    }
  };
});