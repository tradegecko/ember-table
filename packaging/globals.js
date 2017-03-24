var Writer = require('broccoli-writer');
var fs = require('fs');
var path = require('path');
var Promise = require('RSVP').Promise;
var walk = require('walk-sync');

// TODO(azirbel): Log ember version and register with Ember.libraries?
var Globals = function (inputTree) {
  options = {};
  if (!(this instanceof Globals)) {
    return new Globals(inputTree, options);
  }
  this.inputTree = inputTree;
  this.outputPrefix = 'ember-table';

  // The old global names aren't consistent: some are on Ember.Table, some on
  // Ember.AddeparMixins, and some just on Ember. For backwards-compatibility
  // we need to maintain the same old names.
  this.globalNameMapping = {
    'ember-table/components/ember-table': 'Ember.Table.EmberTableComponent',
    'ember-table/mixins/mouse-wheel-handler': 'Ember.MouseWheelHandlerMixin',
    'ember-table/mixins/register-table-component': 'Ember.Table.RegisterTableComponentMixin',
    'ember-table/mixins/resize-handler': 'Ember.AddeparMixins.ResizeHandlerMixin',
    'ember-table/mixins/scroll-handler': 'Ember.ScrollHandlerMixin',
    'ember-table/mixins/show-horizontal-scroll': 'Ember.Table.ShowHorizontalScrollMixin',
    'ember-table/mixins/style-bindings': 'Ember.AddeparMixins.StyleBindingsMixin',
    'ember-table/mixins/table-block': 'Ember.Table.TableBlock',
    'ember-table/mixins/table-container': 'Ember.Table.TableBlock',
    'ember-table/mixins/touch-move-handler': 'Ember.TouchMoveHandlerMixin',
    'ember-table/models/column-definition': 'Ember.Table.ColumnDefinition',
    'ember-table/models/row': 'Ember.Table.Row',
    'ember-table/components/body-table-container': 'Ember.Table.BodyTableContainer',
    'ember-table/components/column-sortable-indicator': 'Ember.Table.ColumnSortableIndicator',
    'ember-table/components/footer-table-container': 'Ember.Table.FooterTableContainer',
    'ember-table/components/header-block': 'Ember.Table.HeaderBlock',
    'ember-table/components/header-cell': 'Ember.Table.HeaderCell',
    'ember-table/components/header-row': 'Ember.Table.HeaderRow',
    'ember-table/components/header-table-container': 'Ember.Table.HeaderTableContainer',
    'ember-table/components/lazy-table-block': 'Ember.LazyTableBlock',
    'ember-table/components/scroll-container': 'Ember.Table.ScrollContainer',
    'ember-table/components/scroll-panel': 'Ember.Table.ScrollPanel',
    'ember-table/components/table-cell': 'Ember.Table.TableCell',
    'ember-table/components/table-row': 'Ember.Table.TableRow'
  };
};

Globals.prototype = Object.create(Writer.prototype);
Globals.prototype.constructor = Globals;

Globals.prototype.write = function(readTree, destDir) {
  var _this = this;

  this.addLinesToOutput = function(output, lines) {
    lines.forEach(function(line) {
      output.push(line);
    });
  };

  return new Promise(function(resolve) {
    readTree(_this.inputTree).then(function(srcDir) {
      var output = [
        "define('ember', ['exports'], function(__exports__) {",
        "  __exports__['default'] = window.Ember;",
        "});",
        "",
        "window.Ember.Table = Ember.Namespace.create();",
        "window.Ember.AddeparMixins = {};"];

      // Get a listing of all hbs files from inputTree and make sure each one
      // is registered on Ember.TEMPLATES
      var templateFiles = walk(srcDir).filter(function(f) {
        return /^templates.*js$/.test(f);
      });
      templateFiles.forEach(function(filename) {
        // Add ember-table namespace and remove .js extension
        var filePath = 'ember-table/' + filename.slice(0, -3);
        var parts = filePath.split(path.sep);
        output.push("window.Ember.TEMPLATES['" +
            parts.slice(2).join('/') + "']" +
            " = require('" + filePath + "')['default'];");
      });

      // Classes to register on the application's container. We need this
      // because we used to refer to component by their full, global name
      // (Ember.Table.HeaderTableContainer), but now we use the view name
      // (header-table-container). So Ember needs to know where to find those
      // component.
      var toRegister = [];

      // Define globals and register on the container
      for (key in _this.globalNameMapping) {
        // Define the global object, like Ember.Table.EmberTableComponent = ...
        output.push("window." + _this.globalNameMapping[key] +
            " = require('" + key + "')['default'];");
        // Register on the container. We only need to register component and
        // components.
        var type = key.split('/')[1].replace(/s$/, '')
        if (type === 'view' || type === 'component') {
          toRegister.push({
            type: type,
            moduleName: key,
            containerName: key.split('/')[2]
          });
        }
      }

      // On loading the ember application, register all component and components on
      // the application's container
      _this.addLinesToOutput(output, [
        "Ember.onLoad('Ember.Application', function(Application) {",
          "Application.initializer({",
            "name: 'ember-table',",
            "initialize: function(container) {"
      ]);
      _this.addLinesToOutput(output, toRegister.map(function(item) {
        return "container.register('" + item.type + ':' + item.containerName +
            "', require('" + item.moduleName + "')['default']);";
        })
      );
      _this.addLinesToOutput(output, [
            "}",
          "});",
        "});"
      ]);

      // For backwards compatibility, set a layoutName so the component
      // actually renders
      _this.addLinesToOutput(output, [
        "Ember.Table.EmberTableComponent.reopen({",
        "layoutName: 'components/ember-table'",
        "});"
      ]);

      // Register table-component with handlebars so users can just use
      // {{table-component}}
      output.push("Ember.Handlebars.helper('table-component', " +
                  "Ember.Table.EmberTableComponent);");

      fs.writeFileSync(path.join(destDir, 'globals-output.js'),
          output.join("\n"));
      resolve();
    });
  });
};

module.exports = Globals;
