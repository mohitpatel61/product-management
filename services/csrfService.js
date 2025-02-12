const csrf = require('csrf');
const { validationResult } = require('express-validator');
const csrfProtection = new csrf();

module.exports = {
  // Generate a CSRF token for the session
  generateToken: (req) => {
    // Ensure csrfSecret is available in the session
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = csrfProtection.secretSync(); // Generate once per session
    }
    // Create a new CSRF token using the session secret
    return csrfProtection.create(req.session.csrfSecret);
  },

  verifyToken: (req, res, next) => {
    try {
      const csrfTokenFromClient = req.body["csrf-token"] || req.headers["x-csrf-token"];

      if (!req.session.csrfSecret) {
        return res.status(403).json({ error: "Missing CSRF secret" });
      }

      if (!csrfTokenFromClient) {
        return res.status(403).json({ error: "Missing CSRF token in the request" });
      }

      if (!csrfProtection.verify(req.session.csrfSecret, csrfTokenFromClient)) {
        return res.status(403).json({ error: "Invalid CSRF token" });
      }

      next(); // Proceed if CSRF check passes
    } catch (error) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }
  }
};
