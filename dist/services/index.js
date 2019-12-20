"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helperService_1 = __importDefault(require("./helperService"));
exports.default = {
    getItem: getItem
};
function getItem(req, res, param, property) {
    if (req.params[param]) {
        var ids_1 = __spreadArrays(new Set(req.params[param].split(",")));
        helperService_1.default.readDataJsonAsync("oddschecker.json")
            .then(function (obj) {
            if (obj) {
                var result = [];
                for (var index = 0; index < ids_1.length; index++) {
                    var id = ids_1[index];
                    if (Number(id)) {
                        var object = helperService_1.default.getObject(obj, property, id);
                        if (object) {
                            result.push(object);
                        }
                    }
                    else {
                        return res
                            .status(400)
                            .send("Invalid request: valid numeric " + param + " - " + id + " required!");
                    }
                }
                if (result) {
                    return res.status(200).send(result);
                }
                else {
                    return res.status(404).send("Record not found");
                }
            }
            else {
                return res.status(404).send("Data not found");
            }
        })
            .catch(console.error);
    }
    else {
        return res
            .status(400)
            .send("Invalid request: valid numeric comma delimited list of " + param + "(s) required!");
    }
}
