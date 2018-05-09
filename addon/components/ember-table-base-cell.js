import Component from '@ember/component';
import { addObserver, removeObserver } from '@ember/object/observers';
import { htmlSafe } from '@ember/string';
import { computed, get } from '@ember/object';
import { scheduler, Token } from 'ember-raf-scheduler';

export default Component.extend({
  tagName: 'td',
  attributeBindings: ['style:style'],

  init() {
    this._super(...arguments);
    this.token = new Token();
  },

  willDestroy() {
    this.token.cancel();
  },

  didInsertElement() {
    if (this.get('isFixed')) {
      this.scheduleSync();

      // TODO: For now we are just watching rows for changes in height, but
      // theoretically anything can change the height of a row. We need
      // to come up with a better solution.
      addObserver(this, 'rowValue', this, this.scheduleSync);
    }
  },

  willDestroyElement() {
    if (this.get('isFixed')) {
      removeObserver(this, 'rowValue', this, this.scheduleSync);
    }
  },

  scheduleSync() {
    scheduler.schedule(
      'sync',
      () => {
        let { height } = this.element.getBoundingClientRect();

        this.set('cellHeight', height || 0);
      },
      this.token
    );
  },

  isFixed: computed('columnIndex', 'numFixedColumns', {
    get() {
      let numFixedColumns = this.get('numFixedColumns');
      return (
        this.get('columnIndex') === 0 && Number.isInteger(numFixedColumns) && numFixedColumns !== 0
      );
    }
  }),

  value: computed('row', 'column.valuePath', {
    get() {
      let row = this.get('row');
      let valuePath = this.get('column.valuePath');
      return get(row, valuePath);
    }
  }),

  style: computed('column.width', {
    get() {
      return htmlSafe(
        `width: ${this.get('column.width')}px; min-width: ${this.get('column.width')}px;`
      );
    }
  }),

  fixedCellStyle: computed('column.width', 'cellHeight', {
    get() {
      return htmlSafe(`width: ${this.get('column.width')}px; min-width: ${this.get(
        'column.width'
      )}px; \
height: ${this.get('cellHeight')}px;`);
    }
  }),

  actions: {
    onCellEvent(args) {
      this.sendAction('onCellEvent', args);
    }
  }
});
