# CSS Modules

__Work in progress__

A new stab at CSS Modules, simplified code.

### Specifications

```css
/* base.css */

.button {
  display: inline-block;
  padding: .25em .5em;
}

.icon {
  display: inline-block;
  padding: .25em;
}

```



#### `@import * as base from '/path';`

Imports all class names into local scope, prefixed with `base`

```css
@import * as base from './base.css';

.iconButton {
  compose: base.button;
}
```


  
#### `@import classname [, classname] from '/path';`

Imports class names into local scope

```css
@import button, icon from './base.css';

.iconButton {
  compose: button, icon;
}
```



#### `@import from '/path';`

Includes all styles into bundle

```css
@import from './base.css';
```



#### Declaration `composes: classname [, classname];`

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


#### License MIT