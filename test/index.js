import { readFileSync } from 'fs'
import { resolve } from 'path'
import test from 'tape'
import CSSModules from '../source/index.js'


// map exports
const index_box = '._example_index_box'
const index_card = '._example_index_card'
const index_section = '._example_index_section'
const index_componentVariant = '._example_index_componentVariant'
const nested_block = '._style_nested_nested_block'
const base_block = '._style_base_block'
const component_base = '._style_component_base'

const normalImport = "@import '/path/file.css';"
const complex_selector = `h1#root > p ~ ${index_card} ${index_section}:not(:first-child):hover ${index_box}`


test('Load and parse a css file', (t) => {

  let parser = CSSModules()
  let file = resolve(__dirname, '../example/index.css')
  let context = parser.load(file)


  t.equal(context.exports.box, index_box)
  t.equal(context.exports.card, `${index_card} ${index_box}`)
  t.equal(context.exports.section, `${index_section} ${index_box} ${base_block} ${nested_block}`)
  t.equal(context.exports.componentVariant, `${index_componentVariant} ${component_base} ${index_card} ${index_box}`)


  let css = parser.stringify()

  t.ok(~css.indexOf(normalImport), 'normal @import behaviour')
  t.ok(~css.indexOf(complex_selector), 'replace class names with generated ones')

  t.end()
})


test('require() hook', (t) => {
  let parser = CSSModules()

  parser.requireHook()

  let exports = require('../example/index.css')
  let classes = ['box', 'card', 'section', 'componentVariant']

  t.deepEqual(Object.keys(exports), classes)
  t.equal(exports.box, index_box)
  t.equal(exports.card, `${index_card} ${index_box}`)

  t.end()
})