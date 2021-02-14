import ConfigSchema from './ConfigSchema'

/**
 * Lista schemas do sistema
 *
 * @name Schemas
 * @module schemas
 * @category Schemas
 * @subcategory Schemas
 * @example Carregamento da classe na aplicação
 *   const config = { list: Schemas.loadSchemas() }
 */
export class Schemas {
  static loadSchemas () {
    return [
      ConfigSchema
    ]
  }
}
