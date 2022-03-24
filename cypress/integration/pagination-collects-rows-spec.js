import { recurse } from '../../src'

describe('Table', () => {
  it('collects all sorted last names', () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
    cy.contains('th.sorterHeader', 'Last Name')
      .click()
      .should('have.class', 'sortingAsc')

    recurse(
      () => cy.get('[value=next]'),
      ($button) => $button.attr('disabled') === 'disabled',
      {
        log: 'The last page',
        timeout: 10_000,
        // delay: 500,
        // collect all last names
        reduceFrom: [],
        reduceLastValue: true,
        reduce(names) {
          // because we want to keep the same
          // "names" array, we just push items
          cy.get('tbody tr:visible td:nth-child(3)')
            .should('have.length.lte', 5)
            .each(($td) => names.push($td.text()))
        },
        post() {
          cy.get('[value=next]').click()
        },
        yield: 'reduced',
      },
    )
      .should('have.length', 23)
      .invoke('join', ',')
      .then(cy.log)
  })
})
