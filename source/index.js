import { readFileSync } from 'fs'
import css from 'css'
import imports from './imports.js'
import context from './context.js'
import resolve from './resolve.js'
import setName from './setName.js'


const defaults = {
  resolve,
  setName,
}


export default (options) => {
  options = Object.assign({}, defaults, options)

  const { resolve } = options
  const cache = new Map()
  const plugins = []
  const parser = {
    options,
    cache,
    plugins,
  }


  parser.stringify = () => {
    let source = ''

    for (let file of cache.values()) {
      source += css.stringify(file.ast) + '\n\n'
    }

    return source
  }


  parser.use = (...handlers) => {
    plugins.push(...handlers)
  }


  parser.load = (path, options = {}) => {
    if (cache.has(path)) {
      return cache.get(path)
    }

    const { from, type } = options

    if (from) {
      path = resolve(path, from)
    }

    const source = readFileSync(path, 'utf8')
    const ast = css.parse(source)
    const module = {
      type: type || 'module',
      path,
      source,
      ast,
      imports: {},
      context: {},
      exports: {},
    }

    for (let plugin of plugins) {
      plugin({ parser, module })
    }

    // save to cache
    cache.set(path, module)

    return module
  }


  // set default plugins
  parser.use(imports, context)


  return parser
}