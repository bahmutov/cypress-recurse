/// <reference types="cypress" />
import { recurse } from '../..'

it('gets 7', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
  )
})

it('gets 7 after 50 iterations or 30 seconds', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      limit: 50, // max number of iterations
      timeout: 30000, // time limit in ms
    },
  )
})
