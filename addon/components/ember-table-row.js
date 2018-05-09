import Component from '@ember/component';
import layout from '../templates/components/ember-table-row';
import { A as emberA } from '@ember/array';
import { readOnly } from '@ember/object/computed';
import { isNone } from '@ember/utils';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['et-tr'],
  classNameBindings: ['isSelected'],
  attributeBindings: ['style:style'],

  /**
   * Component that for table cell. This outer cell is a <td> component that wraps outside the
   * rendered cell view.
   */
  _outerCellComponent: 'ember-table-cell',
  _cells: null,

  selected: false,

  columns: readOnly('row.api.columns'),
  cellProxyClass: readOnly('row.api.cellProxyClass'),
  cellCache: readOnly('row.api.cellCache'),
  numFixedColumns: readOnly('row.api.numFixedColumns'),
  selectedRows: readOnly('row.api.selectedRows'),

  rowValue: readOnly('row.value'),
  rowIndex: readOnly('row.index'),

  init() {
    this._super(...arguments);
    this._cells = emberA();
  },

  cells: computed('columns.[]', {
    get() {
      let _rowComponent = this;
      let _cache = this.get('cellCache');
      let columns = this.get('columns');
      let numColumns = get(columns, 'length');

      let { _cells } = this;

      if (numColumns !== _cells.length) {
        while (_cells.length < numColumns) {
          _cells.push(this.get('cellProxyClass').create({ _cache, _rowComponent }));
        }

        while (_cells.length > numColumns) {
          _cells.pop();
        }
      }

      for (let i = 0; i < numColumns; i++) {
        let cell = _cells[i];
        let column = columns.objectAt !== undefined ? columns.objectAt(i) : columns[i];

        cell.set('column', column);
        cell.set('columnIndex', i);
        cell.set('row', this.get('row'));
        cell.set('targetTable', this.get('row.api.targetObject'));
      }

      return _cells;
    }
  }),

  isSelected: computed('selectedRows.[]', 'rowValue', {
    get() {
      return this.get('selectedRows').indexOf(this.get('rowValue')) >= 0;
    }
  }),

  style: computed('row.api.staticRowHeight', {
    get() {
      let staticRowHeight = this.get('row.api.staticRowHeight');
      if (!isNone(staticRowHeight)) {
        return `height: ${staticRowHeight}px;`;
      }
      return '';
    }
  }),

  click(event) {
    let tableObject = this.get('row.api.targetObject');
    tableObject.send('onRowClicked', event, this.get('rowIndex'));

    this.sendAction('onClick', event, this.get('rowIndex'), this.get('rowValue'));
  },

  doubleClick(event) {
    this.sendAction('onDoubleClick', event, this.get('rowIndex'), this.get('rowValue'));
  }
});
