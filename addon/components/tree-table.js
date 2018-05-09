import layout from '../templates/components/ember-table';
import EmberTable2 from './ember-table';
import { readOnly } from '@ember/object/computed';

export default EmberTable2.extend({
  layout,

  rows: readOnly('tree'),

  actions: {
    onRowToggled(row) {
      let { tree } = this;

      if (row.collapse) {
        tree.expand(row);
      } else {
        tree.collapseNode(row);
      }
    }
  }
});
