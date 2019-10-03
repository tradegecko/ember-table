'use strict';

module.exports = {
  name: 'ember-table-legacy',

  included: function(app) {
    this._super.included(app);

    app.import('node_modules/antiscroll/antiscroll.js');
    app.import('node_modules/antiscroll/antiscroll.css');
    // We install jquery-custom-ui from /vendor
    // app.import('node_modules/jquery-ui/jquery-ui.js');
    app.import('node_modules/jquery-mousewheel/jquery.mousewheel.js');
  },

  afterInstall: function() {
    // this.addBowerPackageToProject('antiscroll');
    // this.addBowerPackageToProject('jquery-mousewheel');
    // this.addBowerPackageToProject('jquery-ui');
  }
};
