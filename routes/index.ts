import * as  express from 'express';
const router = express.Router()
import * as service from '../services'

// middleware that is specific to this router
router.use(function timeLog (req:any, res:any, next: any) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/events/:event_id', (req:any, res:any) => {
  return service.getItem(req,res,'event_id', 'eventId');
})

router.get('/subevents/:subevent_id', (req:any, res:any) => {
  return service.getItem(req,res,'subevent_id', 'subeventId');
})

router.get('/markets/:market_id', (req:any, res:any) => {
  return service.getItem(req,res,'market_id', 'marketId');
})

router.get('/bets/:bet_id', (req:any, res:any) => {
  return service.getItem(req,res,'bet_id', 'betId');
})


module.exports = router;