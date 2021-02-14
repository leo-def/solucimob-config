// frameworks
import _ from "lodash";
import { ModelFactory } from "../commons/ModelFactory";
import { AuthError } from "../errors/AuthError";
import { ConfigResponse } from "../types/api/config/ConfigResponse";

/**
 * Serviço de consulta de configuração
 */
export class ConfigService {
  //#region  API
  async find(req: any, res: any) {
    try {
      const configWrapper = ModelFactory.getModel("Config");
      if (!configWrapper) {
        throw new Error(
          "Não foi possível carregar a persistência do modelo Config."
        );
      }
      const configModel = configWrapper.model;

      const config = await configModel
        .findOne()
        .sort({ created_at: -1 })
        .exec();

      if (!config) {
        throw new AuthError("Configuração não encontrada");
      }
      res.handleResponse(req, res, new ConfigResponse(config));
    } catch (err) {
      if (err.forbiddenResponse) {
        return req.forbiddenResponse(req, res, err);
      } else {
        return req.handleError(req, res, err);
      }
    }
  }
  //#endregion  API
}

export const service = new ConfigService();
export default service;
