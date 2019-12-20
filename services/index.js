const helperService = require('./helperService')

module.exports = {
  getItem: getItem
};

function getItem(req, res, param, property) {
  if (req.params[param]) {
    const ids = [...new Set(req.params[param].split(","))];
    helperService.readDataJsonAsync("oddschecker.json")
      .then(obj => {
        if (obj) {
          let result = [];

          for(let index = 0; index < ids.length; index++) {
            let id = ids[index];
            if (Number(id)) {
              let object = helperService.getObject(obj, property, id);
              if (object) {
                result.push(object);
              }
            } else {
              return res
                .status(400)
                .send(`Invalid request: valid numeric ${param} - ${id} required!`);
            }
          }

          if (result) {
            return res.status(200).send(result);
          } else {
            return res.status(404).send("Record not found");
          }
        } else {
          return res.status(404).send("Data not found");
        }
      })
      .catch(console.error);
  } else {
    return res
      .status(400)
      .send(
        `Invalid request: valid numeric comma delimited list of ${param}(s) required!`
      );
  }
}

