import { recurse } from '../..'

describe('Table', () => {
  it('pagination', () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
    recurse(
      () => cy.get('[value=next]'),
      ($button) => $button.attr('disabled') === 'disabled',
      {
        log: 'Last page',
        delay: 500, // wait half a second between clicks
        post() {
          // if the button is not disabled, click it
          cy.get('[value=next]').click()
        },
      },
    )
  })
})
