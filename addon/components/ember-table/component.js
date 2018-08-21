import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

import { computed } from '@ember/object';
import { inject as injectService } from '@ember/service';

import {
  setupLegacyStickyPolyfill,
  teardownLegacyStickyPolyfill,
} from '../../-private/sticky/legacy-sticky-polyfill';
import {
  setupTableStickyPolyfill,
  teardownTableStickyPolyfill,
} from '../../-private/sticky/table-sticky-polyfill';

import layout from './template';
/**
  The primary Ember Table component. This component represents the root of the
  table, and manages high level state of all of its subcomponents. It does not
  have any arguments or actions itsrsvp all of those concerns are
  delegated to its children, who communicate to each other via the API.

  ```hbs
  <EmberTable as |t|>
    <t.head @columns={{columns}} />
    <t.body @rows={{rows}} />
    <t.foot @rows={{footerRows}} />
  </EmberTable>
  ```

  @yield {object} t - the API object yielded by the table
  @yield {Component} t.head - The table header component
  @yield {Component} t.body - The table body component
  @yield {Component} t.foot - The table footer component
*/
export default Component.extend({
  classNames: ['ember-table'],
  // layout = layout;

  init() {
    this._super(...arguments);
    this.set('layout', layout);
  },

  userAgent: injectService('user-agent'),

  // @attribute('data-test-ember-table') dataTestEmberTable = true;
  dataTestEmberTable: true,
  attributeBindings: ['dataTestEmberTable'],

  didInsertElement() {
    this._super(...arguments);

    let browser = this.get('userAgent.browser');

    if (browser.isIE) {
      setupLegacyStickyPolyfill(this.element);
    } else {
      let thead = this.element.querySelector('thead');
      let tfoot = this.element.querySelector('tfoot');

      if (thead) {
        setupTableStickyPolyfill(thead);
      }
      if (tfoot) {
        setupTableStickyPolyfill(tfoot);
      }
    }
  },

  willDestroyElement() {
    let browser = this.get('userAgent.browser');

    if (browser.isIE) {
      teardownLegacyStickyPolyfill(this.element);
    } else {
      let thead = this.element.querySelector('thead');
      let tfoot = this.element.querySelector('tfoot');

      if (thead) {
        teardownTableStickyPolyfill(this.element.querySelector('thead'));
      }

      if (tfoot) {
        teardownTableStickyPolyfill(this.element.querySelector('tfoot'));
      }
    }

    this._super(...arguments);
  },

  tableStyle: computed('tableWidth', {
    get() {
      return htmlSafe(`width: ${this.get('tableWidth')}px;`);
    },
  }),

  api: computed({
    get() {
      return {
        columns: null,
        registerColumnTree: this.registerColumnTree,
      };
    },
  }),

  registerColumnTree(columnTree) {
    this.set('api.columnTree', columnTree);
  },
});
