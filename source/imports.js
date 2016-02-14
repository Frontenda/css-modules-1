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


export default (context, { load }) => {
  const { path, ast, imports, local, exports } = context
  const { rules } = ast.stylesheet

  filterRules(rules, (rule) => {
    let [ toImport, request ] = rule.import.split('from')

    // format request string, remove whitespace & quotes
    request = request.trim().replace(/^["']|["']$/g, '')

    let importsContext = load(request, path)

    // if no class to import, return
    if (!toImport) return

    // prefix imports
    if (~toImport.indexOf('*')) {
      let [ asterix, prefix ] = toImport.split('* as ')

      prefix = prefix.trim() + '.'

      Object.keys(importsContext.exports).forEach((name) => {
        imports[prefix + name] = importsContext.exports[name]
      })
    }
    else {
      // format names
      toImport = toImport.split(',').map(name => name.trim())

      toImport.forEach((name) => {
        var className = importsContext.exports[name]

        if (!className) {
          throw new Error(`Imported value '${name}' not found in ${request}`)
        }

        imports[name] = className
      })
    }
  })
}