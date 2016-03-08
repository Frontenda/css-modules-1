import CSSModules from '../../source/index.js'


const parser = CSSModules()

// hook into node's `require()` module loader
require.extensions['.css'] = (module, filename) => {
  const { exports } = parser.load(filename)
  const source = 'module.exports = ' + JSON.stringify(exports)

  return module._compile(source, filename)
}


export default parser