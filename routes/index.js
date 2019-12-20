const express = require('express')
const router = express.Router()
const service = require('../services')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/events/:event_id', function (req, res) {
  return service.getItem(req,res,'event_id', 'eventId');
})

router.get('/subevents/:subevent_id', function (req, res) {
  return service.getItem(req,res,'subevent_id', 'subeventId');
})

router.get('/markets/:market_id', function (req, res) {
  return service.getItem(req,res,'market_id', 'marketId');
})

router.get('/bets/:bet_id', function (req, res) {
  return service.getItem(req,res,'bet_id', 'betId');
})


module.exports = router