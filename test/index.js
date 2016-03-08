import { resolve } from 'path'
import test from 'tape'
import CSSModules from '../source/index.js'


test('basic functionality', (t) => {
  const css = CSSModules()
  const file = resolve(__dirname, '../example/basic/index.css')
  const { exports } = css.load(file)
  const string = css.stringify()

  const grid = '_basic_defaults_grid'
  const block = '_basic_base_block'
  const inline_block = '_basic_base_inline-block'
  const box = '_basic_index_box'
  const card = `_basic_index_card`
  const section = `_basic_index_section`
  const complex_selector = `h1.header > p ~ .${card} .${section}:not(:first-child):hover .${box}`

  t.equal(exports.box, box)
  t.equal(exports.card, `_basic_index_card ${box} ${block}`)
  t.equal(exports.section, `_basic_index_section ${inline_block} ${grid}`)

  t.ok(string.includes(complex_selector), 'replace class names with generated ones')
  t.ok(!string.includes('compose'), 'compose declarations are removed')

  t.end()
})


test('nested imports', (t) => {
  const css = CSSModules()
  const file = resolve(__dirname, '../example/nested/index.css')
  const { exports } = css.load(file)

  const block = '_nested_base_block'
  const button = '_nested_theme_button'
  const icon_button = '_nested_index_icon_button'

  t.equal(exports.icon_button, `${icon_button} ${button} ${block}`)

  t.end()
})


test('raw imports', (t) => {
  const css = CSSModules()
  const file = resolve(__dirname, '../example/raw/index.css')
  const { exports } = css.load(file)
  const string = css.stringify()

  t.equal(Object.keys(exports).length, 0)
  t.ok(string.includes('.float-left'))
  t.ok(string.includes('.clearfix'))

  t.end()
})


test('ignore normal @import', (t) => {
  const css = CSSModules()
  const file = `${__dirname}/sample/normal_import.css`
  css.load(file)
  const string = css.stringify()

  t.ok(string.includes("@import '/path/to/file.css';"))

  t.end()
})