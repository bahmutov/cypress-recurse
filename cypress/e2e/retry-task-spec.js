it('retries inside the task', () => {
  cy.task('retryRandomNumber', 7).should('equal', 7)
})
