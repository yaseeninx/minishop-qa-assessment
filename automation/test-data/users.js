// Credentials come from MiniShop v1 requirement 2.
const users = {
  valid: { username: 'standard_user', password: 'secret123' },
  wrongPassword: { username: 'standard_user', password: 'wrong_password' },
  unknownUser: { username: 'unknown_user', password: 'secret123' },
};

const messages = {
  invalidLogin: 'Invalid username or password.',
  locked: 'Account locked. Too many failed attempts.',
  emptyCart: 'Your cart is empty.',
};

module.exports = { users, messages };
