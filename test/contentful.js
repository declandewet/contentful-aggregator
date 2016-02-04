import test from 'blue-tape'
import R from 'ramda'
import {oneLine} from 'common-tags'
import contentful from '../src/contentful'

test('contentful', function contentfulTest (t) {
  const curriedSpace = contentful('')

  t.throws(() => contentful(2, 5), /expected a string/, oneLine`
    if given invalid arguments, "contentful()"
    should throw an exception
  `)

  t.ok(R.is(Function, curriedSpace), oneLine`
    if given too few arguments, "contentful()"
    should return a curried function
  `)

  t.end()
})
