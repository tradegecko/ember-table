import Component from '@ember/component';

export default Component.extend ({
  tagName: 'input',
  value: null,

  type: 'checkbox',

  // @argument({ defaultIfUndefined: true })
  // @type('boolean')
  // @attribute
  checked: false,

  // @argument({ defaultIfUndefined: true })
  // @type('boolean')
  // @attribute
  disabled: false,

  // @argument({ defaultIfUndefined: true })
  // @type('boolean')
  // @attribute
  indeterminate: false,

  // @argument
  // @type('any')
  // @attribute
  value: null,

  // @argument
  // @type(optional(Action))
  onClick: null,

  // @argument
  // @type(optional(Action))
  onChange: null,

  // @argument
  // @type('string')
  // @attribute('aria-label')
  ariaLabel: null,

  click(event) {
    this.sendAction('onClick', event);
  },

  change(event) {
    let checked = this.element.checked;
    let indeterminate = this.element.indeterminate;
    let value = this.get('value');

    // Checked and indeterminate state have been changed, but that's not DDAU!
    // Reset the change, send the action and wait for it to be changed manually
    this.element.checked = this.get('checked');
    this.element.indeterminate = this.get('indeterminate');

    this.sendAction('onChange', checked, { value, indeterminate }, event);
  },
});
