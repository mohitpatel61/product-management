const csrf = require('csrf');
const csrfProtection = new csrf();

module.exports = {
  generateToken: (req) => {
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = csrfProtection.secretSync(); // Generate once per session
    }
    return csrfProtection.create(req.session.csrfSecret);
  },

  verifyToken: (req) => {
    const csrfTokenFromClient = req.body['csrf-token']; // Token from form

    console.log('csrfTokenFromClient:', csrfTokenFromClient);
    console.log('Session CSRF Secret:', req.session.csrfSecret);

    if (!req.session.csrfSecret) {
      throw new Error('Missing CSRF secret');
    }

    if (!csrfTokenFromClient) {
      throw new Error('Missing CSRF token in form');
    }

    // Validate CSRF token using the session secret
    if (!csrfProtection.verify(req.session.csrfSecret, csrfTokenFromClient)) {
      throw new Error('Invalid CSRF token');
    }
  }
};
