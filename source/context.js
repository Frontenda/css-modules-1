const REGEX_CLASS = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g
const REGEX_NON_CLASS = /^[^.]|[#>:~]/


const filterClass = (rule) => {
  if (rule.type != 'rule') return
  // ignore complex selector rules
  if (rule.selectors.length > 1) return
  // ignore non single class selectors
  if (REGEX_NON_CLASS.test(rule.selectors[0])) return

  return true
}


const fmtClasses = (value, handler) => (
  ' ' + value.split(',').map(name => handler(name.trim())).join(' ')
)


export default ({ parser, module }) => {
  const { path, ast, imports, context, exports, type } = module
  const { rules } = ast.stylesheet
  const { setName } = parser.options

  // ignore raw imports
  if (type == 'raw') return

  for (let rule of rules.filter(filterClass)) {
    const { selectors, declarations } = rule
    const [ selector ] = rule.selectors
    const className = selector.replace('.', '')
    const name = setName(className, path)

    let classes = name

    // set compose declarations
    for (let i = 0; i < declarations.length; ++i) {
      const { property, value } = declarations[i]

      if (property == 'compose') {
        classes += fmtClasses(value, (name) => {
          let className = context[name] || imports[name]

          if (!className) {
            throw new Error(`Selector '${name}' not found in ${path}`)
          }

          return className
        })

        // remove declaration
        declarations.splice(i, 1)

        break
      }
    }

    // replace selector with new class name
    context[className] = name
    exports[className] = classes
  }

  const fmtSelector = (rule) => {
    rule.selectors = rule.selectors.map((selector) => (
      selector.replace(REGEX_CLASS, (_, className) => (
        '.' + (context[className] || className)
      ))
    ))
  }

  // replace class selector with generated name
  for (let rule of rules) {
    if (rule.type != 'rule') fmtSelector(rule)
    if (rule.type != 'media') rule.rules.forEach(fmtSelector)
  }
}