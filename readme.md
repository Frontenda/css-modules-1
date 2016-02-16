# CSS Modules

A simpler stab at CSS modules, based on `reworkcss/css`.


### API

```js
import { writeFileSync } from 'fs'
import CSSModules from '@carrd/css-modules'

const modules = CSSModules(options)

const { exports } = modules.load('./index.css')
// exports.button == '._computed_css_class_name'

// add other files
modules.load('./base.css')
modules.load('./theme.css')

writeFileSync('./bundle.css', modules.stringify())
```


##### `options`

- `resolve` - add a function which resolves the requested path from `.load(path)`, format `resolve(path, from)`
- `setClass` - add a function which will generate the class names, format `setClass(name, file)` 


##### `parser.load(path)`

```js
const context = parser.load('./index.css')
```

Loads a CSS file from a given `path` and returns a `context` object:

- `source` - file source
- `ast` - CSS abstract syntax tree
- `path` - file path
- `imports` - imports class names
- `local` - local, context bound, class names
- `exports` - exported class names


##### `parser.stringify()`

Clears all loaded files and returns a bundled CSS string.

```js
parser.load('./index.css')

let css = parser.stringify()
```


##### `parser.use(plugin)`

The parser uses a middleware style plugin system which runs the function on every file with the following format:

```js

parser.use((context, parser) => {
  // act on the context
})
```



### `require()` hook example

Hook into Node.js' `require()` module loader.

```js
import { readFileSync } from 'fs'
import CSSModules from '@carrd/css-modules'

const parser = CSSModules()

require.extensions['.css'] = (module, filename) => {
  const { exports } = parser.load(filename)
  const source = 'module.exports = ' + JSON.stringify(exports)

  return module._compile(source, filename)
}
```



### Specifications


##### `@import * as base from '/path';`

Imports all class names into local scope, prefixed with `base`

```css
@import * as base from './base.css';

.iconButton {
  compose: base.button;
}
```


  
##### `@import classname [, classname] from '/path';`

Imports class names into local scope

```css
@import button, icon from './base.css';

.iconButton {
  compose: button, icon;
}
```



##### `@import from '/path';`

Includes all styles into bundle

```css
@import from './base.css';
```



##### `Declaration `composes: classname [, classname];``

Composes parent class name with selected class names: `.iconButton` => `.iconButton .button .icon`

```css
@import icon from './base.css';

.button {
  border: 1px solid #DEDEDE;
}

.iconButton {
  compose: button, icon;
  font-size: .875em;
}
```


##### `License MIT`