const passport = require('passport');
const GoogleStragey = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user,done) => {
    done(null,user.id)
});

passport.deserializeUser((id,done) => {
   User.findById(id).then((user) => {
    done(null,user);
   });
});

passport.use(
    new GoogleStragey({
        // options for the google strategy
        callbackURL:'/auth/google/redirect',
        clientID:keys.google.clientID,
        clientSecret: keys.google.clientSecret
    },(accessToken,refreshToken,profile,done) => {
        // check if user already exist in our database
        User.findOne({googleId : profile.id}).then((currentUser) => {
            if(currentUser){
                //already have the user
                console.log('user is:',currentUser);
                done(null,currentUser);
            }else{
                //if not, create user in our database
                new User({
                    username : profile.displayName,
                    googleId : profile.id,
                    thumbnail: profile._json.image.url
                }).save().then((newUser) => {
                    console.log('new user created :' + newUser);
                    done(null, newUser);
                });
            }
        })
    })
)