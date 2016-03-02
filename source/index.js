import { dirname, basename, resolve } from 'path'
import { readFileSync } from 'fs'
import css from 'css'
import imports from './imports.js'
import local from './local.js'


const setClass = (name, file) => {
  let component = dirname(file).split('/').pop()
  let filename = basename(file, '.css')

  return `._${component}_${filename}_${name}`
}


const resolvePath = (request, from) => {
  if (request[0] == '.') {
    request = resolve(dirname(from), request)
  }

  // TODO: add npm modules resolution

  return request
}


const defaults = {
  resolve: resolvePath,
  setClass,
}


export default (options) => {
  options = Object.assign({}, defaults, options)

  const cache = new Map()
  const plugins = []
  const { resolve } = options
  const parser = Object.create({
    get plugins () { return plugins },
    get options () { return options },
  })


  parser.use = (...handlers) => {
    plugins.push(...handlers)
  }


  parser.load = (path, from) => {
    if (cache.has(path)) {
      return cache.get(path)
    }

    if (from) {
      path = resolve(path, from)
    }

    const source = readFileSync(path, 'utf8')
    const ast = css.parse(source)
    const context = {
      path,
      source,
      ast,
      imports: {},
      local: {},
      exports: {},
    }

    for (let plugin of plugins) {
      plugin(context, parser)
    }

    // save to cache
    cache.set(path, context)

    return context
  }


  parser.stringify = () => {
    let source = ''

    for (let file of cache.values()) {
      source += css.stringify(file.ast) + '\n\n'
    }

    // clear cache on stringify
    cache.clear()

    return source
  }


  // set default plugins
  parser.use(imports, local)


  return parser
}