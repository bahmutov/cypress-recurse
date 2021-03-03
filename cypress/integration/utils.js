/**
 * Utility function to return a different value after N attempts
 */
export const getTo = (n) => {
  let k = 0
  return () => {
    k += 1
    return cy.wrap(k)
  }
}
