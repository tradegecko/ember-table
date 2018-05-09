import EmberObject, { computed as emberComputed, get, set } from '@ember/object';

const SUPPORTS_NEW_COMPUTED = true;

export default EmberObject.extend({
  column: null,

  _cache: null,
  _rowComponent: null,
  rowValue: emberComputed.alias('_rowComponent.rowValue'),
  rowIndex: emberComputed.alias('_rowComponent.rowIndex'),

  init() {
    this.setProperties = Object.create(null);
  },

  value: emberComputed('rowValue', 'column.valuePath', {
    get() {
      let rowValue = this.get('rowValue');
      let valuePath = this.get('column.valuePath');

      return get(rowValue, valuePath);
    },
    set(key, value) {
      let rowValue = this.get('rowValue');
      let valuePath = this.get('column.valuePath');

      set(rowValue, valuePath, value);
    }
  }),

  unknownProperty(key) {
    let prototype = Object.getPrototypeOf(this);

    let setValueFunc = (context, k, value) => {
      let cache = context.get('_cache');
      let rowValue = context.get('rowValue');
      let valuePath = context.get('column.valuePath');

      if (!cache.has(rowValue)) {
        cache.set(rowValue, Object.create(null));
      }

      return (cache.get(rowValue)[`${valuePath}:${k}`] = value);
    };

    let getValueFunc = (context, key) => {
      let cache = context.get('_cache');
      let rowValue = context.get('rowValue');
      let valuePath = context.get('column.valuePath');

      if (cache.has(rowValue)) {
        return cache.get(rowValue)[`${valuePath}:${key}`];
      }

      return undefined;
    };

    if (SUPPORTS_NEW_COMPUTED) {
      prototype[key] = emberComputed('rowValue', 'column.valuePath', {
        get(key) {
          return getValueFunc(this, key);
        },

        set(key, value) {
          return setValueFunc(this, key, value);
        }
      });
    } else {
      prototype[key] = emberComputed('rowValue', 'column.valuePath', function(key, value) {
        if (arguments.length > 1) {
          return setValueFunc(this, key, value);
        }

        return getValueFunc(this, key);
      });
    }
  }
});
