import { resolve, dirname } from 'path'


const resolvePath = (request, from) => {
  if (request[0] == '.') {
    request = resolve(dirname(from), request)
  }

  return request
}


const filterRules = (rules, handler) => {
  for (let i = 0; i < rules.length; ++i) {
    let rule = rules[i]

    if (rule.type != 'import') continue
    // ignore regular imports
    if (!~rule.import.indexOf('from')) continue

    handler(rule, i)

    // remove rule
    rules.splice(i--, 1)
  }
}


export default (context, parser) => {
  const { file, ast, local, imported, exports } = context
  const { rules } = ast.stylesheet
  const resolve = parser.options.resolve || resolvePath

  filterRules(rules, (rule) => {
    let [ toImport, request ] = rule.import.split('from')

    // format request string, remove whitespace & quotes
    request = request.trim().replace(/^["']|["']$/g, '')
    // resolve full path of request
    // TODO: add npm modules
    request = resolve(request, context.file)

    let importedContext = parser.load(request)

    // if no class to import, return
    if (!toImport) return

    // prefix imports
    if (~toImport.indexOf('*')) {
      let [ asterix, prefix ] = toImport.split('* as ')

      prefix = prefix.trim() + '.'

      Object.keys(importedContext.exports).forEach((name) => {
        imported[prefix + name] = importedContext.exports[name]
      })
    }
    else {
      // format names
      toImport = toImport.split(',').map(name => name.trim())

      toImport.forEach((name) => {
        var className = importedContext.exports[name]

        if (!className) {
          throw new Error(`Imported value '${name}' not found in ${request}`)
        }

        imported[name] = className
      })
    }
  })
}