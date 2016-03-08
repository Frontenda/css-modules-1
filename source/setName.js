import { dirname, basename } from 'path'


export default (name, path) => {
  const folder = dirname(path).split('/').pop()
  const file = basename(path, '.css')

  return `_${folder}_${file}_${name}`
}