/// <reference types="cypress" />
import { recurse } from '../../src'

describe('reduce the data', () => {
  it('accumulates the items seen using external list', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const seen = []

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        seen.push(item)
        return seen.length === 10
      },
      {
        limit: 10,
        delay: 100,
      },
    )

    cy.wrap(seen).should(
      'deep.equal',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    )
  })

  it('accumulates the items seen', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const seen = []

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 10
      },
      {
        limit: 10,
        delay: 100,
        log: false,
        reduceFrom: seen,
        reduce(acc, item) {
          acc.push(item)
        },
        reduceLastValue: true,
      },
    )
    cy.wrap(seen, { log: false }).should(
      'deep.equal',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    )
  })

  it('returns the changed accumulator', () => {
    const items = [1, 2, 3, 4]

    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 4
      },
      {
        limit: 4,
        delay: 100,
        log: false,
        reduceFrom: 0,
        reduce(acc, item) {
          // console.log({ acc, item })
          return acc + item
        },
        reduceLastValue: true,
        yield: 'reduced',
      },
    ).should('equal', 10)
  })

  it('passes the reduced value to the predicate', () => {
    // draw a random number until we get a number we have already seen
    recurse(
      () => cy.wrap(Cypress._.random(10)),
      (n, numbers) => numbers.has(n),
      {
        limit: 20,
        delay: 100,
        log: false,
        reduceFrom: new Set(),
        reduce(numbers, n) {
          numbers.add(n)
        },
        yield: 'reduced',
      },
    ).then((numbers) => {
      cy.log(...numbers)
    })
  })

  it('calls the reduce the right number of times', () => {
    const items = [1, 2, 3, 4]

    let calledCount = 0
    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 4
      },
      {
        limit: 4,
        delay: 100,
        log: false,
        reduceFrom: 0,
        reduce(acc, item) {
          calledCount += 1
          return acc + item
        },
        reduceLastValue: false,
      },
    ).then(() => {
      expect(calledCount).to.equal(3)
    })
  })

  it('calls the reduce the right number of times with the last value', () => {
    const items = [1, 2, 3, 4]

    let calledCount = 0
    recurse(
      () => cy.wrap(items.shift()),
      (item) => {
        return item === 4
      },
      {
        limit: 4,
        delay: 100,
        log: false,
        reduceFrom: 0,
        reduce(acc, item) {
          calledCount += 1
          return acc + item
        },
        reduceLastValue: true,
      },
    ).then(() => {
      expect(calledCount).to.equal(4)
    })
  })

  context('cy commands in accumulator', () => {
    it('without last value', () => {
      const items = [1, 2, 3, 4]
      let calledCount = 0
      recurse(
        () => cy.wrap(items.shift()),
        (item) => {
          return item === 4
        },
        {
          limit: 4,
          delay: 100,
          log: false,
          reduceFrom: 0,
          reduce(acc, item) {
            calledCount += 1
            return cy.wrap(item).then((x) => acc + x)
          },
          reduceLastValue: false,
          yield: 'reduced',
        },
      )
        .should('equal', 6)
        .then(() => {
          expect(calledCount).to.equal(3)
        })
    })

    it('with last value', () => {
      const items = [1, 2, 3, 4]
      let calledCount = 0
      recurse(
        () => cy.wrap(items.shift()),
        (item) => {
          return item === 4
        },
        {
          limit: 4,
          delay: 100,
          log: false,
          reduceFrom: 0,
          reduce(acc, item) {
            calledCount += 1
            return cy.wrap(item).then((x) => acc + x)
          },
          reduceLastValue: true,
          yield: 'reduced',
        },
      )
        .should('equal', 10)
        .then(() => {
          expect(calledCount).to.equal(4)
        })
    })

    it('push items into array', () => {
      const items = [1, 2, 3, 4]
      let calledCount = 0
      recurse(
        () => cy.wrap(items.shift()),
        (item) => {
          return item === 4
        },
        {
          limit: 4,
          delay: 100,
          log: false,
          reduceFrom: [],
          reduce(numbers, item) {
            // notice here we do not have to return
            // a new reduced value, so we can
            // both use cy.commands and push into the array
            calledCount += 1
            cy.log(`list: ${numbers.join(',')}`)
            numbers.push(item)
          },
          reduceLastValue: true,
          yield: 'reduced',
        },
      )
        .should('deep.equal', [1, 2, 3, 4])
        .then(() => {
          expect(calledCount).to.equal(4)
        })
    })
  })

  context('equivalent tests', () => {
    it('uses a local variable to store the results', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      let sum = 0

      recurse(
        () => cy.wrap(items.shift()),
        // the last number is not included
        (item) => item === 10,
        {
          log: false,
          delay: 0,
          post({ value }) {
            sum += value
          },
        },
      ).then(() => {
        expect(sum, 'sum 1 to 9').to.equal(45)
      })
    })

    it('uses an accumulator and yields the sum', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      recurse(
        () => cy.wrap(items.shift()),
        // the last number is not included
        (item) => item === 10,
        {
          log: false,
          delay: 0,
          // start with value of 0
          reduceFrom: 0,
          // and add each item produced by the first function
          reduce(acc, item) {
            return acc + item
          },
          // and yield the reduced value
          yield: 'reduced',
        },
      )
        // the sum is yielded as the subject
        // no need for a cy.then(callback)
        .should('equal', 45)
    })

    it('uses an accumulator including the last value', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      recurse(
        () => cy.wrap(items.shift()),
        // 10 will be the last value
        (item) => item === 10,
        {
          log: false,
          delay: 0,
          // start with value of 0
          reduceFrom: 0,
          // and include the value that made the predicate return true
          reduceLastValue: true,
          // and add each item produced by the first function
          reduce(acc, item) {
            return acc + item
          },
          // and yield the reduced value
          yield: 'reduced',
        },
      ).should('equal', 55)
      cy.wrap(items, 'items were consumed').should('deep.equal', [])
    })

    it('uses the accumulated value in the predicate', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      recurse(
        () => cy.wrap(items.shift()),
        (item, acc) => acc > 30,
        {
          log: false,
          delay: 0,
          // start with value of 0
          reduceFrom: 0,
          // and add each item produced by the first function
          reduce(acc, item) {
            return acc + item
          },
          // and yield the reduced value
          yield: 'reduced',
        },
      ).should('equal', 36) // 1+2+...+8 = 36
      // 9 was the item that made the predicate return true
      // but it was not included in the sum after being removed
      // so the only item left in the array is 10
      cy.wrap(items, 'remaining items').should('deep.equal', [10])
    })

    it('reverses an array', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      recurse(
        () => cy.wrap(items.shift()),
        (x) => x === undefined,
        {
          log: false,
          delay: 0,
          // accumulate all items into an array
          reduceFrom: [],
          reduce(acc, item) {
            acc.unshift(item)
            return acc
          },
          yield: 'reduced',
        },
      ).should('deep.equal', ['e', 'd', 'c', 'b', 'a'])
    })
  })
})
