// @ts-check

import '../../../commands'
import { getTo } from '../utils'

describe('cy.recurse', () => {
  it('exists', () => {
    expect(cy, 'cy object').to.have.property('recurse')
  })

  it('works as a custom command', () => {
    cy.recurse(getTo(3), (x) => x === 3).should('equal', 3)
  })
})
