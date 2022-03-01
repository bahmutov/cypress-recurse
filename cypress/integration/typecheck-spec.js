// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

describe('typechecking', () => {
    it('correctly infers the type from the return value', () => {
        /** @type {Cypress.Chainable<number>} */
        const isNumber = recurse(() => cy.wrap(1), (x) => x === 1).should('be.equal', 1)
    })

    it('correctly infers the type of a promise', () => {
        /** @type {Cypress.Chainable<number>} */
        const isNumber = recurse(() => cy.wrap(Promise.resolve(1)), (x) => x === 1).should('be.equal', 1)
    })
})
