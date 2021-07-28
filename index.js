'use strict'

// Make sure that the dates in our promotions are always valid.
// In real data, these would be fixed values.
const now = new Date()
const twoMonthsAgo = new Date()
twoMonthsAgo.setMonth(now.getMonth() - 2)
const lastMonth = new Date()
lastMonth.setMonth(now.getMonth() - 1)
const nextMonth = new Date()
nextMonth.setMonth(now.getMonth() + 1)


const PRODUCT_DATA_BY_GTIN = {
  '00000000000055': { name: 'Lemons', price: 25 },
  '00000000000056': { name: 'Orange', price: 30 },
  '00000000000057': { name: 'Lime', price: 25 },
  '00000001000001': { name: 'Flora', price: 125 },
  '00000001000002': { name: 'Cheese', price: 200 },
  '00000001000003': { name: 'Pilgrims Cheese', price: 250 },
  '00000030001010': { name: 'Pizza Margherita', price: 499 },
  '00000030001020': { name: 'Pizza Pepperoni', price: 499 },
  '00000050000001': { name: 'Ketchup', price: 289 },
  '00000060000009': { name: 'Mayonaise', price: 250 },
  '00000080000001': { name: 'Cola', price: 150 },
  '00000090000001': { name: 'Biscuits', price: 99 },
}

const PROMOTION_DATA_BY_GTIN = {
  '00000030001020': { type: 'priceCut', newPrice: 350, validFrom: lastMonth, validTo: nextMonth },
  '00000060000009': { type: 'priceCut', newPrice: 150, validFrom: twoMonthsAgo, validTo: lastMonth },
  '00000000000056': { type: 'multiBuy', requiredQuantity: 2, newPrice: 40, validFrom: lastMonth, validTo: nextMonth },
}

function createReceiptFromGtins(basketGtins) {
  // set up the empty receipt
  const receipt = { items: [], subtotal: 0, promotions: 0, total: 0 }

  // calculate the items with their prices
  for (const gtin of basketGtins) {
    const product = PRODUCT_DATA_BY_GTIN[gtin]
    if (!product) {
      console.error('Missing product for GTIN:', gtin)
      receipt.items.push({ gtin })
    } else {
      console.debug(`Found product ${product.name} at ${product.price}p`)
      // store the items with their names and original prices in the receipt
      receipt.items.push({ gtin, name: product.name, price: product.price })
      // calculate a running subtotal of the original prices
      receipt.subtotal += product.price
    }
  }


  // work out the promotions...
  const now = new Date()
  const multiBuyQuantities = {}

  for (const item of receipt.items) {
    const promotion = PROMOTION_DATA_BY_GTIN[item.gtin]

    // check we have a promotion and it's valid for the current date
    if (promotion && promotion.validFrom < now && now < promotion.validTo) {

      if (promotion.type === 'priceCut') {
        // price cut promotions apply to each item individually
        console.debug(`Applying price cut promotion for product ${item.name}: ${promotion.newPrice}`)
        item.discount = promotion.newPrice - item.price
        receipt.promotions += item.discount

      } else if (promotion.type === 'multiBuy') {
        // multi buy promotions need a certain number of items to be valid
        const previousQuantity = multiBuyQuantities[item.gtin] || 0
        const currentQuantity = previousQuantity + 1
        console.debug(`Counting multi buy promotion for product ${item.name}: ` +
          `${currentQuantity} / ${promotion.requiredQuantity}`)

        if (currentQuantity === promotion.requiredQuantity) {
          // if the multi buy promotion has reached its required quantity
          // then add the promotion to the receipt
          item.discount = promotion.newPrice - (promotion.requiredQuantity * item.price)
          receipt.promotions += item.discount
          // and reset the promotion quantity, in case there are further items that match
          multiBuyQuantities[item.gtin] = 0
        } else {
          // if the multi buy promotion has not yet reached the required quantity
          // then we need to store the current quantity ready for the remaining items
          multiBuyQuantities[item.gtin] = currentQuantity
        }

      } else {
        console.error('Unknown promotion type:', promotion.type)
      }
    }
  }

  // work out the overall total by adding the original price subtotal to the (negative) promotion total
  receipt.total = receipt.subtotal + receipt.promotions

  return receipt
}

module.exports = {
  PRODUCT_DATA_BY_GTIN,
  createReceiptFromGtins,
}
