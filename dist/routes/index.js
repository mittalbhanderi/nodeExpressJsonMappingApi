"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var services_1 = __importDefault(require("../services"));
var router = new express_1.Router();
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
router.get('/events/:event_id', function (req, res) {
    return services_1.default.getItem(req, res, 'event_id', 'eventId');
});
router.get('/subevents/:subevent_id', function (req, res) {
    return services_1.default.getItem(req, res, 'subevent_id', 'subeventId');
});
router.get('/markets/:market_id', function (req, res) {
    return services_1.default.getItem(req, res, 'market_id', 'marketId');
});
router.get('/bets/:bet_id', function (req, res) {
    return services_1.default.getItem(req, res, 'bet_id', 'betId');
});
exports.default = router;
