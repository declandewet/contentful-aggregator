import R from 'ramda'
import {Future} from 'ramda-fantasy'

// we can't use `import` syntax for contentful...
const contentful = require('contentful')

export default R.curry((accessToken, space) => {
  const validate = R.unless(R.is(String), (x) => {
    throw new Error(`expected a string, but instead got ${x}`)
  })

  validate(accessToken)
  validate(space)

  const client = contentful.createClient({ accessToken, space })

  const fetchContentType = (id) => new Future((resolve, reject) => {
    client.contentType(id).then(resolve, reject)
  })

  const fetchSpace = new Future((resolve, reject) => {
    client.space().then(resolve).catch(reject)
  })

  const fetchLocales = fetchSpace.map(R.prop('locales'))

  const fetchLocaleCodes = fetchLocales.map(R.map(R.prop('code')))

  return { fetchContentType, fetchSpace, fetchLocales, fetchLocaleCodes }
})
