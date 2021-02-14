import { ModelFactory } from '../commons/ModelFactory'
import { Schemas } from '../schemas/Schemas'

const config = { list: Schemas.loadSchemas() }

export const loadSchemas = (): any => {
  return ModelFactory.getInstance(config)
}

/**
 * Instância um objeto de gerênciamento de objetos de persistência
 *
 * @name ModelFactoryLoader
 * @module config
 * @category Config
 * @subcategory ModelFactoryLoader
 * @example Carregamento da classe na aplicação
 *   app.set('modelFactory', ModelFactoryLoader.loadSchemas());
 */
export class ModelFactoryLoader {
  static loadSchemas () {
    return loadSchemas()
  }
}

export default ModelFactoryLoader.loadSchemas()
