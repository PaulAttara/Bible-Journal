const User = require('../models/users')
const { OAuth2Client } = require('google-auth-library')

const CLIENT_ID = process.env.CLIENT_ID


const auth = async (req, res, next) => {
    let token = '';
    console.log('ENTERED AUTh!!!!')

    if(req.body.token){
        token = req.body.token
    }
    else{
        token = req.header('token')
    }

    if(!token){
        var value = "; " + req.headers.cookie;
        var parts = value.split("; " + 'token' + "=");
        if (parts.length == 2) 
        token = parts.pop().split(";").shift();
    }
    
    const client = new OAuth2Client(CLIENT_ID);

    if(!token){ // no token received, so user is not signed in
        console.log('no user signed in')
        // throw new Error('no user signed in')
        return next(new Error('Please Authenticate'))
    }

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        const userId = payload['sub'] // use this to identify user!!
       
        try {
            const returnedUser = await User.findOne({ userId: userId })
            if(!returnedUser){
                console.log('You need to create an account!')
                return next(new Error('Please Authenticate'))
            }
            req.user = returnedUser
            req.token = token
            return next()

        } catch (e) {
            return next(new Error('Please Authenticate'))
        }
      }
      verify().catch(console.error);
    //   return next(new Error('Please Authenticate'))
}

module.exports = auth

