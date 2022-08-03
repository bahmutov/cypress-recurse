# cypress-recurse

[![ci status][ci image]][ci url] [![renovate-app badge][renovate-badge]][renovate-app] ![cypress version](https://img.shields.io/badge/cypress-9.7.0-brightgreen) [![cypress-recurse](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/count/tbtscx/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/tbtscx/runs)

> A way to re-run Cypress commands until a predicate function returns true

Jump to: [Options](#options), [Examples](#examples), [Debugging](#debugging), [Videos](#videos).

## Install

```shell
npm i -D cypress-recurse
# or use Yarn
yarn add -D cypress-recurse
```

## Use

```js
import { recurse } from 'cypress-recurse'

it('gets 7', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
  )
})
```

The predicate function should return a boolean OR use assertions to throw errors. If the predicate returns undefined, we assume it passes, see examples in [expect-spec.js](./cypress/integration/expect-spec.js).

```js
it('works for 4', () => {
  recurse(
    () => cy.wrap(4),
    (x) => {
      expect(x).to.equal(4)
    },
  ).should('equal', 4)
})
```

**Important:** the commands inside the first function cannot fail - otherwise the entire test fails. Thus make them as "passive" as possible, and let the predicate function decide if the entire function needs to be retried or not.

## Yields

The `recurse` function yields the subject of the command function.

```js
import { recurse } from 'cypress-recurse'

it('gets 7', () => {
  recurse(
    () => cy.wrap(7),
    (n) => n === 7,
  ).should('equal', 7)
})
```

## Options

```js
it('gets 7 after 50 iterations or 30 seconds', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      log: true,
      limit: 50, // max number of iterations
      timeout: 30000, // time limit in ms
      delay: 300, // delay before next iteration, ms
    },
  )
})
```

You can see the default options

```js
import { RecurseDefaults } from 'cypress-recurse'
```

### log

The log option can be a boolean flag or your own function. For example to pretty-print each number we could:

```js
recurse(
  () => {...},
  (x) => x === 3,
  {
    log: (k) => cy.log(`k = **${k}**`),
  }
)
```

You can simply print a given string at the successful end of the recursion

```js
recurse(
  () => {...},
  (x) => x === 3,
  {
    log: 'got to 3!',
  }
)
```

See the [log-spec.js](./cypress/integration/log-spec.js)

### post

If you want to run a few more Cypress commands after the predicate function that are not part of the initial command, use the `post` option. For example, you can start intercepting the network requests after a few iterations:

```js
// from the application's window ping a non-existent URL
const url = 'https://jsonplaceholder.cypress.io/fake-endpoint'
const checkApi = () => cy.window().invoke('fetch', url)

recurse(checkApi, ({ ok }) => ok, {
  post: ({ limit, value }) => {
    // after a few attempts
    // stub the network call and respond
    if (limit === 1) {
      // start intercepting now
      console.log('start intercepting')
      return cy.intercept('GET', url, 'Hello!').as('hello')
    }
    // you can use the value prop to look at the fetch results
  },
})
```

The argument is a single object with `limit`, `value`, `reduced`, and `elapsed` properties.

See the [post-spec.js](./cypress/integration/post-spec.js) and [find-on-page/spec.js](./cypress/integration/find-on-page/spec.js).

**Note:** if you specify both the delay and the `post` options, the delay runs first.

### custom error message

Use the `error` option if you want to add a custom error message when the recursion timed out or the iteration limit has reached the end.

```js
recurse(
  () => {...},
  (x) => x === 3,
  {
    error: 'x never got to 3!',
  }
)
```

### accumulator

Similar to reducing an array, the `reduce` function has an option to accumulate / reduce the values in the given object. The following options work together

- `reduceFrom` is the starting value, like `[]`
- `reduce(acc, item)` receives each value and the current accumulator value
- `reduceLastValue` is false by default, turn it on to call the the `reduce` function with the last value (for which the predicate function has returned true)

TODO: document the above options

If there is a reduced value, it will be passed as the second argument to the predicate function.

See the [reduce-spec.js](./cypress/integration/reduce-spec.js) for examples.

### yield

If you are accumulating a reduced value, you can yield it instead of the last value. You can even yield both the last and the reduced values.

- `yield: "value"` yields the value that passed the predicate function
- `yield: "reduced"` yields the accumulated value
- `yield: "both"` yields an object with `value` and `reduced` properties

See the [reduce-spec.js](./cypress/integration/reduce-spec.js) for examples.

## each

This plugin also includes the `each` function that iterates over the given subject items. It can optionally stop when the separate predicate function returns true.

```js
import { each } from 'cypress-recurse'
it('iterates until it finds the value 7', () => {
  cy.get('li').then(
    each(
      $li => ..., // do something with the item
      $li => $li.text() === '7' // stop if we see "7"
    )
  )
})
```

The `each` function yields the original or transformed items

```js
const numbers = [1, 2, 3, 4]
cy.wrap(numbers)
  .then(
    each(
      (x) => {
        return 10 + x
      },
      // stop when the value is 13
      (x) => x === 13,
    ),
  )
  .should('deep.equal', [11, 12])
```

See the [each-spec.js](./cypress/integration/each/each-spec.js) file.

## Examples

- clear and type text into the input field until it has the expected value, see [type-with-retries-spec.js](./cypress/integration/type-with-retries-spec.js), watch the video [Avoid Flake When Typing Into The Input Elements Using cypress-recurse](https://youtu.be/aYX7OVqp6AE) and read the blog post [Solve Flake In Cypress Typing Into An Input Element
  ](https://glebbahmutov.com/blog/flaky-cy-type/)
- [avoid-while-loops-in-cypress](https://github.com/bahmutov/avoid-while-loops-in-cypress) repo
- [monalego](https://github.com/bahmutov/monalego) repo and [Canvas Visual Testing with Retries](https://glebbahmutov.com/blog/canvas-testing/) blog post, watch [the video](https://www.youtube.com/watch?v=xSK6fe5WD1g)
- [reloading the page until it shows the expected text](./cypress/integration/reload-page/spec.js) recipe
- [pinging the API endpoint until it responds](https://youtu.be/CU8C6MRP_GU)
- [HTML canvas bar chart testing](https://youtu.be/aeBclf9A92A)
- [Browse Reveal.js Slides Using Cypress and cypress-recurse](https://youtu.be/oq2P1wtIZYY)
- opening each accordion panel until we find a button to click [accordion-spec.js](./cypress/integration/accordion-spec.js), see video [Use cypress-recurse To Open Accordion Panels Until It Finds A Button To Click](https://youtu.be/s2_467yUF2Y)

## Debugging

Use options `log: true` and `debugLog: true` to print additional information to the Command Log

```js
recurse(getTo(2), (x) => x === 2, {
  timeout: 1000,
  limit: 3,
  delay: 100,
  log: true,
  debugLog: true,
}).should('equal', 2)
```

![Debug logs](./images/debug-log.png)

## Blog post

Read [Writing Cypress Recurse Function](https://glebbahmutov.com/blog/cypress-recurse/)

## Videos

I have explained how this module was written in the [following videos](https://www.youtube.com/playlist?list=PLP9o9QNnQuAbegJlN5ZTRxqtUBtKwXOHQ)

1. [Call cy task until it returns an expected value](https://youtu.be/r8_hFwYAo5c)
2. [Reusable recursive function](https://www.youtube.com/watch?v=Q_7-gRQLLMA)
3. [Reusable function with attempts limit](https://www.youtube.com/watch?v=I1oNKD6NNjg)
4. [Recursion function with time limit](https://www.youtube.com/watch?v=Cn8Ubhd49Gw)
5. [Convert recurse to use options object](https://youtu.be/DeMRtTD5p7s)
6. [Add JSDoc types to the options parameter](https://youtu.be/g4qispkHH-o)
7. [Published cypress-recurse NPM package](https://www.youtube.com/watch?v=V82p7qTowXg)

### Bonus videos

1. [use cypress-recurse to find the downloaded file](https://www.youtube.com/watch?v=Ty5ltRdgr5M)
2. [canvas visual testing](https://www.youtube.com/watch?v=xSK6fe5WD1g)
3. [wait for API to respond](https://www.youtube.com/watch?v=CU8C6MRP_GU)
4. [get to the last page](https://youtu.be/6-xHHtAzNtk) by clicking the "Next" button
5. [Use cypress-recurse To Scroll The Page Until It Loads The Text We Are Looking For](https://youtu.be/KHn7647xOz8)
6. [Use cypress-recurse Plugin To Confirm The Table Gets Sorted Eventually](https://youtu.be/Ke5Pf6IISn8)
7. [Use cypress-recurse To Ping The Site Before Visiting It](https://youtu.be/8rtBk9MBjXA)
8. [Use cypress-recurse To Click The Back Button Until It No Longer Exists](https://youtu.be/G-4HbUuUqIM)
9. [Reload The Page Until We See 7 Plus Check The Numbers Before That](https://youtu.be/KHJkRp_rRYg)
10. [Click On The Button Until It Becomes Disabled](https://youtu.be/u2JUQY2TE3A)
11. [Stub cy.request Command Using cy.stub And Use cypress-recurse Example](https://youtu.be/rFhTejdPGAM)
12. [Use cypress-recurse To Open Accordion Panels Until It Finds A Button To Click](https://youtu.be/s2_467yUF2Y)
13. [Access The Response Text Yielded By The Plugin cypress-response](https://youtu.be/MRelgoMg230)

## Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2021

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-recurse/issues) on Github

## MIT License

Copyright (c) 2020 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[ci image]: https://github.com/bahmutov/cypress-recurse/workflows/ci/badge.svg?branch=main
[ci url]: https://github.com/bahmutov/cypress-recurse/actions
[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
