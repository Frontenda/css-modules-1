import { dirname, resolve } from 'path'


export default (request, from) => {
  if (request[0] == '.') {
    request = resolve(dirname(from), request)
  }

  // TODO: add npm modules resolution

  return request
}
