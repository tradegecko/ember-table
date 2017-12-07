import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  content: null,
  isShowing: true,
  isHovered: false,
});
