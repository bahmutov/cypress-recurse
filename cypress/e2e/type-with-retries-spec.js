// @ts-check
/// <reference types="cypress" />
// normally this would be import from "cypress-recurse"
import { recurse } from '../../src'

// these tests show flake prevention if the input element
// is NOT disabled at the start and allows to type while
// clearing the input field randomly. For more, read the blog post
// https://glebbahmutov.com/blog/flaky-cy-type/
describe(
  'type with retries',
  {
    viewportHeight: 250,
    viewportWidth: 400,
    defaultCommandTimeout: 2500,
  },
  () => {
    it('is waiting for the input element to become enabled', () => {
      cy.visit('cypress/e2e/type-with-retries.html')
      const text = 'hello there, friend!'
      cy.get('#flaky-input').type(text).should('have.value', text)
    })

    it('enters the text correctly', () => {
      cy.visit('cypress/e2e/type-with-retries.html')
      const text = 'hello there, friend!'

      recurse(
        // the commands to repeat, and they yield the input element
        () => cy.get('#flaky-input').clear().type(text),
        // the predicate takes the output of the above commands
        // and returns a boolean. If it returns true, the recursion stops
        ($input) => $input.val() === text,
        {
          log: false,
          delay: 1000,
        },
      )
        // the recursion yields whatever the command function yields
        // and we can confirm that the text was entered correctly
        .should('have.value', text)
    })
  },
)
