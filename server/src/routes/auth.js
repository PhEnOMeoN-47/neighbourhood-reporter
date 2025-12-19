const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();


router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {

    const user = req.user;


    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "None",
      path: "/",
      domain: ".neighbourhood-reporter.vercel.app",
    });


    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

  }
);

router.get("/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
});


router.get("/failure", (req, res) => {
  res.status(401).send("Google authentication failed");
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    domain: ".neighbourhood-reporter.vercel.app",
  });

  return res.status(200).json({ success: true });
});




module.exports = router;
