module.exports = {
    isAuthenticated: (req, res, next) => {
      if (req.session && req.session.user) {
        return next(); // Proceed to the next middleware or route
      } else {
        req.flash("error", "Please log in to continue.");
        return res.redirect("/user/login");
      }
    },
  };
  