import test from 'tape'
import requireHook from './sample/require_hook.js'

// require hook sample import
import style from '../example/index.css'

test('require() hook', (t) => {
  const index_box = '_example_index_box'
  const index_card = '_example_index_card'

  let classes = ['box', 'card', 'section', 'componentVariant']

  t.deepEqual(Object.keys(style), classes)
  t.equal(style.box, index_box)
  t.equal(style.card, `${index_card} ${index_box}`)

  t.end()
})