// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

describe(
  'type with retries',
  { viewportHeight: 250, viewportWidth: 400 },
  () => {
    it.skip('is flaky without retries', () => {
      cy.visit('cypress/integration/type-with-retries.html')
      const text = 'hello there, friend!'
      cy.get('#flaky-input').type(text).should('have.value', text)
    })

    it('enters the text correctly', () => {
      cy.visit('cypress/integration/type-with-retries.html')
      const text = 'hello there, friend!'

      recurse(
        () => cy.get('#flaky-input').clear().type(text),
        ($input) => $input.val() === text,
      ).should('have.value', text)
    })
  },
)
