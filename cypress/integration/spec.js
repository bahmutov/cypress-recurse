/// <reference types="cypress" />
import { recurse } from '../..'

it('gets 7', () => {
  recurse(
    () => cy.task('randomNumber'),
    (n) => n === 7,
    {
      remainingAttempts: 50,
      timeout: 3000,
    },
  )
})
