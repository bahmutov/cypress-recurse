// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

describe('extra commands option', () => {
  it('can run extra cy commands between iterations', () => {
    // from the application's window ping a non-existent URL
    const url = 'https://jsonplaceholder.cypress.io/fake-endpoint'
    const checkApi = () => cy.window().invoke('fetch', url)
    // @ts-ignore
    const isSuccess = ({ ok }) => ok

    recurse(checkApi, isSuccess, {
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
})
