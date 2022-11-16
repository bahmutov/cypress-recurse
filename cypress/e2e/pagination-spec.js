import { recurse } from '../..'

describe('Table', () => {
  // watch the video
  // "cypress-recurse: Click On The Button Until It Becomes Disabled"
  // https://youtu.be/u2JUQY2TE3A
  it('pagination', () => {
    cy.visit('/cypress/e2e/pagination-sort-filter-manager')
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
})
