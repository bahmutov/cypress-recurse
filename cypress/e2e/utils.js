/**
 * Utility function to return a different value after N attempts
 * @param {number} n - the target number
 */
export const getTo = (n) => {
  let k = 0
  return () => {
    k += 1
    return cy.wrap(k)
  }
}
