"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var routes_1 = __importDefault(require("./routes"));
var mapperService_1 = __importDefault(require("./services/mapperService"));
var lodash_1 = __importDefault(require("lodash"));
var getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};
var app = express_1.default();
var HTTP_PORT = 3000;
app.use("/api", routes_1.default);
app.get("/", function (req, res) {
    var endPoints = ['events', 'subevents', 'markets', 'bets'];
    res.redirect("/api/" + lodash_1.default.sampleSize(endPoints) + "/" + lodash_1.default.sampleSize(mapperService_1.default.getIds(), getRandomInt(100) + 1).join(","));
});
try {
    mapperService_1.default.parseJson().then(function () {
        console.log(mapperService_1.default.getIds());
        app.listen(HTTP_PORT, function () {
            console.log("Feed Processing App listening on port " + HTTP_PORT + "!");
        });
    });
}
catch (err) {
    console.error("Error parsing bookmaker feed! " + err);
}
