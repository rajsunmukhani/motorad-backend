const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Model/User'); 

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback', 
    }, async (accessToken, refreshToken, profile, done) => {
        // Check if the user already exists in your database
        try {
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                // User already exists, proceed with the login
                done(null, existingUser);
            } else {
                // Create a new user in your database
                const newUser = await new User({
                    googleId: profile.id,
                    username: profile.name.givenName || profile.displayName, // Assign a default value if not available
                    email: profile.emails[0].value, // Get the primary email
                    image: profile._json.picture,
                }).save();
                done(null, newUser); // Pass the new user to the done callback
            }
        } catch (error) {
            console.error(error);
            done(error, null); // Handle error in callback
        }
    })
);

// Serialize and deserialize the user
passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID in session
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user); // Retrieve the user by ID
    });
});

module.exports = passport;
