'use strict'

const express = require('express')
const CheckoutController = require('../../controllers/checkout.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

const router = express.Router()

router.post('/preview', asyncHandler(CheckoutController.checkoutPreview))

module.exports = router