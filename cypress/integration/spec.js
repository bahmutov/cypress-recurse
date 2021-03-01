/// <reference types="cypress" />
import { recurse } from '../..'

it('gets 7', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      limit: 50, // max number of iterations
      timeout: 3000, // time limit in ms
    },
  )
})
