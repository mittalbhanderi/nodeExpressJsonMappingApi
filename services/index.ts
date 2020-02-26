import HelperService from "./helperService";
import { inject, injectable } from "inversify";

@injectable()
export default class Index {
  protected helperService: HelperService;

  constructor(@inject(HelperService) _helperService: HelperService) {
    this.helperService = _helperService;
  }

  getItem(req: any, res: any, param: string, property?: string) {
    if (req.params[param]) {
      const ids: Array<string> = [
        ...new Set<string>(req.params[param].split(","))
      ];

      this.helperService
        .readDataJsonAsync("oddschecker.json")
        .then((obj: any) => {
          if (obj) {
            let result = [];

            for (let index = 0; index < ids.length; index++) {
              let id: string = ids[index];
              if (Number(id)) {
                let object = this.helperService.getObject(obj, property, id);
                if (object) {
                  result.push(object);
                }
              } else {
                return res
                  .status(400)
                  .send(
                    `Invalid request: valid numeric ${param} - ${id} required!`
                  );
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
}
