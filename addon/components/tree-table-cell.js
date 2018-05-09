import { get } from '@ember/object';
import EmberTableCell from './ember-table-cell';

export default EmberTableCell.extend({
  click() {
    let rowNode = this.get('cell.row.value');
    if (this.get('columnIndex') === 0) {
      get(this, 'cell.targetTable').send('onRowToggled', rowNode);
    }
  }
});
