import EmberTableBaseCell from './ember-table-base-cell';
import layout from '../templates/components/ember-table-cell';

export default EmberTableBaseCell.extend({
  layout,
  classNameBindings: ['isFixed::et-td']
});
