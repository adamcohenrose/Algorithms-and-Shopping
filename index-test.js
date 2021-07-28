const expect = require('chai').expect
const { createReceiptFromGtins } = require('./index')

describe('pricing api for students', () => {
  it('should create the correct receipt with no promotions', () => {
    const basketGtins = [
      '00000000000057',
      '00000000000100',
      '00000030001010',
      '00000030001010',
      '00000080000001',
    ]

    const receipt = createReceiptFromGtins(basketGtins)
    expect(receipt).to.deep.equal({
      items: [
        { gtin: '00000000000057', name: 'Lime', price: 25 },
        { gtin: '00000000000100' },
        { gtin: '00000030001010', name: 'Pizza Margherita', price: 499 },
        { gtin: '00000030001010', name: 'Pizza Margherita', price: 499 },
        { gtin: '00000080000001', name: 'Cola', price: 150 },
      ],
      subtotal: 1173,
      promotions: 0,
      total: 1173,
    })
  })

  it('should create the correct receipt with a price cut promotion', () => {
    const basketGtins = [
      '00000000000057',
      '00000030001020',
      '00000030001020',
      '00000080000001',
    ]

    const receipt = createReceiptFromGtins(basketGtins)
    expect(receipt).to.deep.equal({
      items: [
        { gtin: '00000000000057', name: 'Lime', price: 25 },
        { gtin: '00000030001020', name: 'Pizza Pepperoni', price: 499, discount: -149 },
        { gtin: '00000030001020', name: 'Pizza Pepperoni', price: 499, discount: -149 },
        { gtin: '00000080000001', name: 'Cola', price: 150 },
      ],
      subtotal: 1173,
      promotions: -298,
      total: 875,
    })
  })

  it('should create the correct receipt with an out of date price cut promotion', () => {
    const basketGtins = [
      '00000000000057',
      '00000030001020',
      '00000060000009',
      '00000080000001',
    ]

    const receipt = createReceiptFromGtins(basketGtins)
    expect(receipt).to.deep.equal({
      items: [
        { gtin: '00000000000057', name: 'Lime', price: 25 },
        { gtin: '00000030001020', name: 'Pizza Pepperoni', price: 499, discount: -149 },
        { gtin: '00000060000009', name: 'Mayonaise', price: 250 },
        { gtin: '00000080000001', name: 'Cola', price: 150 },
      ],
      subtotal: 924,
      promotions: -149,
      total: 775,
    })
  })

  it('should create the correct receipt with a multibuy promotion', () => {
    const basketGtins = [
      '00000000000057',
      '00000000000056',
      '00000080000001',
      '00000000000056',
    ]

    const receipt = createReceiptFromGtins(basketGtins)
    expect(receipt).to.deep.equal({
      items: [
        { gtin: '00000000000057', name: 'Lime', price: 25 },
        { gtin: '00000000000056', name: 'Orange', price: 30 },
        { gtin: '00000080000001', name: 'Cola', price: 150 },
        { gtin: '00000000000056', name: 'Orange', price: 30, discount: -20 },
      ],
      subtotal: 235,
      promotions: -20,
      total: 215,
    })
  })

  it('should create the correct receipt with a multibuy promotion with extra items', () => {
    const basketGtins = [
      '00000000000057',
      '00000000000056',
      '00000080000001',
      '00000000000056',
      '00000000000056',
      '00000000000056',
      '00000000000056',
    ]

    const receipt = createReceiptFromGtins(basketGtins)
    expect(receipt).to.deep.equal({
      items: [
        { gtin: '00000000000057', name: 'Lime', price: 25 },
        { gtin: '00000000000056', name: 'Orange', price: 30 },
        { gtin: '00000080000001', name: 'Cola', price: 150 },
        { gtin: '00000000000056', name: 'Orange', price: 30, discount: -20 },
        { gtin: '00000000000056', name: 'Orange', price: 30 },
        { gtin: '00000000000056', name: 'Orange', price: 30, discount: -20 },
        { gtin: '00000000000056', name: 'Orange', price: 30 },
      ],
      subtotal: 325,
      promotions: -40,
      total: 285,
    })
  })
})
