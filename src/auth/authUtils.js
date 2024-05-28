'use strict'

const JWT = require('jsonwebtoken')

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

        return {accessToken, refreshToken}
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    createTokenPair
}