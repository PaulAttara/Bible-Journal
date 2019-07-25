const express = require('express')
const bodyParser = require('body-parser')
const { OAuth2Client } = require('google-auth-library')

const User = require('../models/users')
const router = new express.Router()

router.use(bodyParser.json());

const CLIENT_ID = process.env.CLIENT_ID


router.post('/signin', async (req, res) => {
    const token = req.body.TOKEN_ID
    const client = new OAuth2Client(CLIENT_ID);
    console.log('ENTERED SERVER SIGN IN FUNCTION')
    res.cookie('token', token)

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
        const payload = ticket.getPayload();
        const userId = payload['sub'] // use this to identify user!!
        const name = payload['name']
        const email = payload['email']
        
        // create user only if does not exist
        // check if user exists
        try {
            const returnedUser = await User.findOne({ userId: userId })
            if(returnedUser){
                console.log('USER ALREADY EXISTS!!!!!')
                return res.status(200).send({ returnedUser, token })
            }
            // create user
            const user = new User({
                userId,
                name,
                email
            }) 
            await user.save()
            console.log('CREATED USER!!!')
            res.status(201).send({ user, token }) // this returns the mongoose saved user, not the manually created one
        } catch (e) {
            res.status(400).send(e.message)
        }
      }
      verify().catch(console.error);
});


router.post('/signout', async (req, res) => {
    console.log('entered signout')
    try {
        // req.headers.cookie = 'token' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        // cookies.set('token', {maxAge: Date.now()});
        res.clearCookie("token");


        return res.status(200).send('token cookie successfully deleted')
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router
