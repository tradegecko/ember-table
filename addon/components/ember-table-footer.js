import EmberTableBaseCell from './ember-table-base-cell';
import { computed, get } from '@ember/object';

import layout from '../templates/components/ember-table-footer';

export default EmberTableBaseCell.extend({
  layout,
  classNameBindings: ['isFixed::et-tf'],

  footerValue: computed('column.valuePath', 'rowValue', {
    get() {
      let valuePath = this.get('column.valuePath');
      let rowValue = this.get('rowValue');

      return get(rowValue, valuePath);
    }
  }),

  actions: {
    onFooterEvent() {
      this.sendAction('onFooterEvent', ...arguments);
    }
  }
});
