import { recurse } from '../..'

describe('Table', () => {
  // watch the video
  // "cypress-recurse: Click On The Button Until It Becomes Disabled"
  // https://youtu.be/u2JUQY2TE3A
  it('pagination', () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
    // click on the "next" button
    // until the button becomes disabled
    recurse(
      () => cy.get('[value=next]'),
      // check if the button is disabled using jQuery ".attr()" method
      // https://api.jquery.com/attr/
      ($button) => $button.attr('disabled') === 'disabled',
      {
        log: 'The last page',
        delay: 500, // wait half a second between clicks
        post() {
          // if the button is not disabled, click it
          cy.get('[value=next]').click()
        },
      },
    )
  })

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
        post({ reduced }) {
          cy.get('tbody tr:visible td:nth-child(3)')
            .should('have.length.lte', 5)
            .each(($td) => reduced.push($td.text()))
          cy.get('[value=next]').click()
        },
        yield: 'reduced',
      },
    )
      .invoke('join', ',')
      .then(cy.log)
  })
})
