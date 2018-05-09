import EmberTableRow from './ember-table-row';
import { readOnly } from '@ember/object/computed';

export default EmberTableRow.extend({
  /**
   * @override
   */
  _outerCellComponent: 'tree-table-cell',

  /**
   * @override
   */
  rowValue: readOnly('row.value.value')
});
