// format request string, remove whitespace & quotes
const fmtRequest = (string) => (
  string.trim().replace(/^["']|["']$/g, '')
)


// returns an array of imports:
// [{ type, request, toImport }]
const getImports = (rules) => {
  const imports = []

  for (let i = 0; i < rules.length; ++i) {
    const rule = rules[i]

    if (rule.type != 'import') continue

    if (rule.import.includes('from')) {
      const [ toImport, request ] = rule.import.split('from')

      imports.push({
        request: fmtRequest(request),
        type: 'module',
        toImport,
      })

      // remove rule
      rules.splice(i--, 1)
    }

    if (rule.import.includes('raw')) {
      const [ _, request ] = rule.import.split('raw')

      imports.push({
        request: fmtRequest(request),
        type: 'raw',
      })

      // remove rule
      rules.splice(i--, 1)
    }
  }

  return imports
}


// format import names: 'box, button'
const fmtImportNames = (string) => (
  string.split(',').map(name => name.trim())
)


export default ({ parser, module }) => {
  const { path, ast, imports } = module
  const { rules } = ast.stylesheet

  for (let { type, request, toImport } of getImports(rules)) {
    const newModule = parser.load(request, { type, from: path })

    if (!toImport) continue

    // prefix imports: `theme.button`
    if (toImport.includes('*')) {
      let [ _, prefix ] = toImport.split('* as ')

      prefix = prefix.trim() + '.'

      Object.keys(newModule.exports).forEach((name) => {
        imports[prefix + name] = newModule.exports[name]
      })
    }
    // named imports
    else {
      for (let name of fmtImportNames(toImport)) {
        const className = newModule.exports[name]

        if (!className) {
          throw new Error(`Imported value '${name}' not found in ${request}`)
        }

        imports[name] = className
      }
    }
  }
}