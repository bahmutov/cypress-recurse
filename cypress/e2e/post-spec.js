// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

describe('extra commands option', () => {
  it('can run extra cy commands between iterations', () => {
    // from the application's window ping a non-existent URL
    const url = 'https://jsonplaceholder.cypress.io/fake-endpoint'

    const checkApi = () => cy.window().invoke('fetch', url)

    recurse(checkApi, ({ ok }) => ok, {
      limit: 2,
      delay: 1000,
      log: (r) => cy.log(`response **${r.status}**`),
      post: ({ limit }) => {
        // after a few attempts
        // stub the network call and respond
        console.log('post: limit %d', limit)

        if (limit === 2) {
          // start intercepting now
          console.log('start intercepting')
          return cy.intercept('GET', url, 'Hello!').as('hello')
        }
      },
    })
      // the "checkApi" chain yields the fetch response
      .invoke('text')
      // which should equal our stub
      .should('equal', 'Hello!')

    // confirm the intercept works
    cy.get('@hello')
  })

  it('starts stubbing a method', () => {
    const obj = {
      greeting() {
        return 'not yet'
      },
    }
    recurse(
      () => cy.wrap(obj.greeting()),
      (s) => s === 'ready!',
      {
        limit: 5,
        delay: 500,
        post({ limit }) {
          if (limit === 3) {
            cy.stub(obj, 'greeting').returns('ready!')
          }
        },
      },
    )
      .should('equal', 'ready!')
      // the stub was created and called
      .then(() => {
        // and really was called just once
        // before the recursion has finished
        expect(obj.greeting).to.have.been.calledOnce
      })
  })

  it('passes the value to the post callback', () => {
    const list = ['first', 'second', 'third']
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        post({ value }) {
          expect(value).to.be.oneOf(['first', 'second'])
        },
        limit: 3,
        delay: 500,
        log: true,
      },
    )
  })

  it('passes the reduced value to the post callback', () => {
    const list = ['first', 'second', 'third']
    /** @type {string[]} */
    const seen = []
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        reduceFrom: seen,
        reduce(reduced, s) {
          reduced.push(s)
        },
        post({ reduced }) {
          expect(reduced, 'reduced value in post').to.equal(seen)
        },
        limit: 3,
        delay: 500,
        log: true,
      },
    )
  })

  it('passes the elapsed duration since the recurse start', () => {
    const list = ['first', 'second', 'third']
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        post({ elapsed }) {
          expect(elapsed, 'elapsed').to.be.greaterThan(0)
          cy.log(`elapsed ${elapsed}ms`)
        },
        limit: 3,
        delay: 500,
        log: false,
      },
    )
  })

  it('passes the elapsed human duration since the recurse start', () => {
    const list = ['first', 'second', 'third']
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        post({ elapsedDuration }) {
          expect(elapsedDuration, 'elapsed duration').to.be.a(
            'string',
          )
          cy.log(elapsedDuration)
        },
        limit: 3,
        delay: 1000,
        log: false,
      },
    )
  })

  it('does not pass the last value by default', () => {
    const list = ['first', 'second', 'third']
    const copy = structuredClone(list)
    let k = 0
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        post({ value }) {
          expect(value, 'value').to.be.oneOf(copy)
          k += 1
        },
        limit: 3,
        delay: 1000,
        log: false,
      },
    ).then((value) => {
      expect(value, 'yielded value').to.equal('third')
      expect(k, 'post was called').to.equal(copy.length - 1)
    })
  })

  it('passes the last value', () => {
    const list = ['first', 'second', 'third']
    const copy = structuredClone(list)
    let k = 0
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        postLastValue: true,
        post({ value }) {
          expect(value, 'value').to.be.oneOf(copy)
          k += 1
        },
        limit: 3,
        delay: 1000,
        log: false,
      },
    ).then((value) => {
      expect(value, 'yielded value').to.equal('third')
      expect(k, 'post was called').to.equal(copy.length)
    })
  })

  it('passes the success flag', () => {
    const list = ['first', 'second', 'third']
    const copy = structuredClone(list)
    let k = 0
    recurse(
      () => {
        const s = list.shift()
        return cy.wrap(s)
      },
      (s) => s === 'third',
      {
        postLastValue: true,
        post({ value, success }) {
          expect(value, 'value').to.be.oneOf(copy)
          if (value === 'third') {
            expect(success, 'last value is success').to.be.true
          } else {
            expect(success, 'other values are unsuccessful').to.be
              .false
          }
          k += 1
        },
        limit: 3,
        delay: 1000,
        log: false,
      },
    ).then((value) => {
      expect(value, 'yielded value').to.equal('third')
      expect(k, 'post was called').to.equal(copy.length)
    })
  })
})
