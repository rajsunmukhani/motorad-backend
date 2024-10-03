const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Model/User'); 

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback', 
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                done(null, existingUser);
            } else {
                const newUser = await new User({
                    googleId: profile.id,
                    username: profile.name.givenName || profile.displayName, 
                    email: profile.emails[0].value, 
                    image: profile._json.picture,
                }).save();
                done(null, newUser); 
            }
        } catch (error) {
            console.error(error);
            done(error, null); 
        }
    })
);


passport.serializeUser((user, done) => {
    done(null, user.id); 
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user); 
    });
});

module.exports = passport;
