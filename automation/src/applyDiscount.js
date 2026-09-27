// Function under test, copied verbatim from the assignment brief.
function applyDiscount(price, percent) {
  if (percent < 0 || percent > 100) throw new Error('Invalid discount');
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}

module.exports = { applyDiscount };
