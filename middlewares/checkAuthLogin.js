module.exports = (req, res, next) => {
    if (!req.session.user) {
        req.flash("error", "Please log in first.");
        return res.redirect("/user/login");
    }
    next();
};
