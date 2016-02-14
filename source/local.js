const REGEX_NON_CLASS = /^[^.]|[#>:~]/g
const REGEX_CLASS = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(\s*)/g


const filterRules = (rules, handler) => {
  for (let i = 0; i < rules.length; ++i) {
    let rule = rules[i]

    if (rule.type != 'rule') continue
    // ignore complex selector rules
    if (rule.selectors.length > 1) continue
    // ignore non single class selectors
    if (rule.selectors[0][0] != '.') continue

    handler(rule, i)
  }
}


const forEachType = (declarations, type, handler) => {
  for (let i = 0; i < declarations.length; ++i) {
    if (declarations[i].property == type) {
      handler(declarations[i], i)

      // remove declaration
      declarations.splice(i--, 1)
    }
  }
}


const setCompose = (compose, handler) => (
  ' ' + compose.split(',').map(name => name.trim()).map(handler).join(' ')
)


export default (context, { options }) => {
  const { path, ast, imports, local, exports } = context
  const { rules } = ast.stylesheet
  const { setClass } = options

  filterRules(rules, ({ selectors, declarations }) => {
    let selector = selectors[0].replace('.', '')
    let className = setClass(selector, path)
    let classes = className

    // replace selector with new class name
    local[selector] = className

    forEachType(declarations, 'compose', ({ value }) => {
      className += setCompose(value, (name) => {
        let className = exports[name] || imports[name]

        if (!className) {
          throw new Error(`Selector '${name}' not found in ${path}`)
        }

        return className
      })
    })

    exports[selector] = className
  })

  // replace class names with generated ones from local context
  for (let rule of rules) {
    if (rule.type != 'rule') continue

    rule.selectors = rule.selectors.map(selector => (
      selector.replace(REGEX_CLASS, (match, className, whitespace) => (
        (local[className] ? local[className] : className) + whitespace
      ))
    ))
  }
}