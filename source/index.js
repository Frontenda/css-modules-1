import { readFileSync } from 'fs'
import css from 'css'
import imports from './imports.js'
import local from './local.js'


const defaults = {}


export default (options) => {
  options = Object.assign({}, defaults, options)

  const parser = {
    options,
    cache: {},
    plugins: [],
  }


  parser.use = (...handlers) => {
    parser.plugins.push(...handlers)
  }


  parser.load = (file) => {
    if (parser.cache[file]) {
      return parser.cache[file]
    }

    const source = readFileSync(file, 'utf8')
    const ast = css.parse(source)
    const context = {
      ast,
      file,
      imported: {},
      local: {},
      exports: {},
    }

    for (let plugin of parser.plugins) {
      plugin(context, parser)
    }

    return parser.cache[file] = context
  }


  parser.stringify = () => {
    let files = Object.keys(parser.cache)
    let source = ''

    for (let file of files) {
      source += css.stringify(parser.cache[file].ast) + '\n\n'
    }

    // clear cache on stringify
    parser.cache = {}

    return source
  }


  parser.requireHook = () => {
    require.extensions['.css'] = (module, filename) => {
      const context = parser.load(filename)
      const source = 'module.exports = ' + JSON.stringify(context.exports)

      return module._compile(source, filename)
    }
  }


  // set default plugins
  parser.use(imports, local)

  return parser
}