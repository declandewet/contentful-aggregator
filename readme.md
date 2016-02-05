![contentful-aggregator](http://imgh.us/logo_187.svg)



> Configures content type entries for use in static site generators. Supports linked entries and localization.
> 
> **Please Note** this project is in early stages and follows [Readme-Driven Development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html) practices, so not all the functionality below works yet and the documentation is subject to change at a rapid rate. Consider this project as *unstable* for now.



# Project Status

[![GitHub license](https://img.shields.io/github/license/declandewet/contentful-aggregator.svg?style=flat-square)](https://github.com/declandewet/contentful-aggregator/blob/master/license.md)[![GitHub release](https://img.shields.io/github/release/declandewet/contentful-aggregator.svg?style=flat-square)](https://github.com/declandewet/contentful-aggregator/releases)[![npm](https://img.shields.io/npm/v/contentful-aggregator.svg?style=flat-square)](http://npmjs.org/package/contentful-aggregator)[![npm](https://img.shields.io/npm/dt/contentful-aggregator.svg?style=flat-square)](http://npmjs.org/package/contentful-aggregator)[![node](https://img.shields.io/node/v/contentful-aggregator.svg?style=flat-square)]()

[![Build Status](https://img.shields.io/travis/declandewet/contentful-aggregator.svg?style=flat-square)](https://travis-ci.org/declandewet/contentful-aggregator)[![codecov.io](https://img.shields.io/codecov/c/github/declandewet/contentful-aggregator.svg?style=flat-square)](https://codecov.io/github/declandewet/contentful-aggregator?branch=master)[![bitHound Overall Score](https://www.bithound.io/github/declandewet/contentful-aggregator/badges/score.svg)](https://www.bithound.io/github/declandewet/contentful-aggregator)[![bitHound Code](https://www.bithound.io/github/declandewet/contentful-aggregator/badges/code.svg)](https://www.bithound.io/github/declandewet/contentful-aggregator)

[![Dependency Status](https://img.shields.io/david/declandewet/contentful-aggregator.svg?style=flat-square)](https://david-dm.org/declandewet/contentful-aggregator)[![devDependency Status](https://img.shields.io/david/dev/declandewet/contentful-aggregator.svg?style=flat-square)](https://david-dm.org/declandewet/contentful-aggregator#info=devDependencies)[![bitHound Dependencies](https://www.bithound.io/github/declandewet/contentful-aggregator/badges/dependencies.svg)](https://www.bithound.io/github/declandewet/contentful-aggregator/master/dependencies/npm)[![bitHound Dev Dependencies](https://www.bithound.io/github/declandewet/contentful-aggregator/badges/devDependencies.svg)](https://www.bithound.io/github/declandewet/contentful-aggregator/master/dependencies/npm)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)[![greenkeeper](https://img.shields.io/badge/greenkeeper-enabled-brightgreen.svg?style=flat-square)](http://greenkeeper.io/)



# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->



- [Installation](#installation)
  - [Requirements](#requirements)
  - [Instructions](#instructions)
- [Required Knowledge](#required-knowledge)
  - [A Short Primer on Futures](#a-short-primer-on-futures)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# Installation

### Requirements

- [Node.js](https://nodejs.org/en/download/) v4.0.0 or higher
- NPM (v3.0.0+ recommended) (this comes with Node.js)



### Instructions

`contentful-aggregator` is a [Node](https://nodejs.org) module. So, as long as you have [Node.js and NPM](https://nodejs.org/en/download/), installing `contentful-aggregator` is as simple as running this in a terminal at the root of your project:

``` sh
$ npm install contentful-aggregator --save
```



# Required Knowledge



### A Short Primer on Futures

A careful design decision was made to use Futures in place of Promises for asynchronous control flow in `contentful-aggregator`, and as such, a lot of the documented methods will return a Future. So, for those not familiar with them, here's a short primer.

Futures, otherwise known as Tasks, are similar to Promises, but are a more pure and functional alternative. This means they are easily composed. They look like this:

``` javascript
// fetch :: String -> Future String
const fetch = (url) => new Future((resolve, reject) => {
  const request = new XMLHttpRequest()
  request.addEventListener('load', resolve, false)
  request.addEventListener('error', reject, false)
  request.addEventListener('abort', reject, false)
  request.open('get', url, true)
  request.send()
})
```



Like Promises, Futures need to be unwrapped if you want to access their value. The difference from Promises, however, is that instead of using `.then()` to unwrap a Future, you use either one of `.chain()` or `.map()`.

`.chain()` creates a dependent Future. Here, we create a Future `fetchJSON()` that depends on the result of sequencing `fetch()` (from above) and then `parseJSON()`:

``` javascript
// parseJSON :: String -> Future Object
const parseJSON = (str) => new Future((resolve, reject) => {
  try {
    resolve(JSON.parse(str))
  } catch (error) {
    reject(error)
  }
})

// fetchJSON :: String -> Future Object
const fetchJSON = fetch.chain(parseJSON)
```



We can use `.map()` similarly to unwrap the value and run any function on it. So, if we wanted to only get the `items` property of the JSON response, that would look like this:

``` javascript
// fetchItems :: Future Object -> Future []
const fetchItems = fetchJSON.map(json => json.items)
```



If we wanted to filter out only the items that are new, then we can do that too:

``` javascript
// getNewItems :: Future [Object] -> Future [Object]
const getNewItems = fetchItems.map(items => items.filter(item => item.new))
```



An **important** aspect of Futures that's definitely worth noting is that, unlike Promises, which execute as soon as they are created, none of the above Futures have executed yet or sent any requests over the wire. This is because a Future will only execute once you have explicitly made a call to `.fork()`. This reduces side-effects and contains them to a single place. Like `.then()`, `.fork()` accepts an `onResolved` as well as an `onRejected` handler, but note the difference in order:

``` javascript
getNewItems('/products.json').fork(console.error, console.log) // -> onRejected, onResolved
```



One other interesting aspect is the ability to easily pipe logic - say we need to hit a JSON endpoint, grab a `url` property, and then send another request to that `url` to grab it's HTML. Simple:

``` javascript
// fetchUrlFromUrl :: Future Object -> Future String
const fetchUrlFromUrl = fetchJSON.map(json => json.url).chain(fetch)
```



The biggest strength, especially in the context of `contentful-aggregator`, is the ability for Futures to be easily cached. This means you can take a future that executes an HTTP request, but wrap it in another Future that will return any subsequent calls to `.fork()` from a cache:

``` javascript
// getCachedNewItems :: Future [Object] -> Future [Object]
const getCachedNewItems = Future.cache(getNewItems)

// makes an HTTP request
getCachedNewItems('/products.json').fork(console.error, console.log)

// doesn't make an HTTP request, just returns from cache:
getCachedNewItems('/products.json').fork(console.error, console.log)
```



Futures in `contentful-aggregator` are [based on the Ramda-Fantasy library](https://github.com/ramda/ramda-fantasy/blob/master/docs/Future.md) which include other methods like `ap`, `of`, `chainReject`, `biMap`, and `reject`.



# Usage

`contentful-aggregator` exposes a single curried function that receives two arguments. The first argument is your Contentful API Key, and the second argument is the ID of the space you want to obtain your data from.

``` javascript
import ca from 'contentful-aggregator'

const space = ca('apiToken', 'space')
```



Since this function is curried, you may omit the second argument. Doing so will return a function that has the apiToken, but expects the space ID.

``` javascript
const client = ca('apiToken')
const myPortfolioSpace = client('portfolio site space id')
const myBlogSpace = client('blog site space id')
```