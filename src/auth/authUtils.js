'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../cores/error.response')
const { HEADER } = require('../commons/constants')

// SERVICE
const KeyTokenService = require('../services/keyToken.service')

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (error, decode) => {
            if (error)
                console.error(`Error verify::`, error)
            else
                console.error(`Decode verify::`, decode)
        })

        return { accessToken, refreshToken }
    } catch (error) {
        console.error(error)
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1. Check userId missing
        2. Get accessToken
        3. Verify token
        4. Check user in database
        5. Check keyStore with the userId
        6. Success => return next()
    */

    // Step 1
    const userId = req.headers[HEADER.CLIENT_ID]
    console.log(userId);

    if (!userId) throw new AuthFailureError('Missing userId')

    // Step 2
    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) throw new NotFoundError('User not found')


    const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
    if (refreshToken) {
        try {
            const decode = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decode.userId) throw new AuthFailureError('Invalid token')
            req.keyStore = keyStore
            req.user = decode
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    // Step 3
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    
    if (!accessToken || !accessToken.startsWith('Bearer ')) {
        throw new AuthFailureError('Invalid token format');
    }

    const token = accessToken.split(' ')[1]; // Extract the token part
    console.log(token);
    try {
        const decode = JWT.verify(token, keyStore.publicKey);
        if (userId !== decode.userId) throw new AuthFailureError('Invalid token');
        req.keyStore = keyStore;
        req.user = decode;
        return next();
    } catch (error) {
        throw error;
    }
})

const verifyJWT = (token, keySecret) => {
    return JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}