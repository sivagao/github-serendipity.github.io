// Example custom build usage:
const engine = require('store/src/store-engine')
const storages = [
	require('store/storages/localStorage'),
	require('store/storages/cookieStorage')
]
const plugins = [
	require('store/plugins/defaults'),
	require('store/plugins/expire')
]
export const store = engine.createStore(storages, plugins)

export function hourExpire(hours) {
  return new Date().getTime() + hours * 60 * 60 * 1000;
}

// store.set('foo', 'bar', new Date().getTime() + 3000)
