// Product catalogue from MiniShop v1 requirement 6.
const products = {
  mouse: { name: 'Wireless Mouse', price: 19.99 },
  keyboard: { name: 'Mechanical Keyboard', price: 49.99 },
  hub: { name: 'USB-C Hub', price: 24.99 },
};

// Checkout scenarios. Expected summaries are worked out by hand (not by re-running the app's
// own arithmetic) so the test is an independent oracle for the total.
const checkoutScenarios = [
  {
    title: 'a single item',
    items: [products.mouse.name],
    expectedSummary: '1 item(s), total $19.99', // 19.99
  },
  {
    title: 'one of each product',
    items: [products.mouse.name, products.keyboard.name, products.hub.name],
    expectedSummary: '3 item(s), total $94.97', // 19.99 + 49.99 + 24.99
  },
  {
    title: 'the same item added three times',
    items: [products.mouse.name, products.mouse.name, products.mouse.name],
    expectedSummary: '3 item(s), total $59.97', // 3 x 19.99
  },
];

module.exports = { products, checkoutScenarios };
