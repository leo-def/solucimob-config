import mongoose from 'mongoose'

/**
 * Encapsulamento de valores relacionados ao esquema, para centralizar acesso e evitar
 *
 * @name ModelWrapper
 * @module commons/ModelFactory
 * @category Commons
 * @subcategory ModelFactory
 */
export class ModelWrapper {
  model: any = null;
  schema: any = null;

  /**
   * @constructor
   *
   * @param {any} key Chave de identificação do esquema
   * @param {any} schemaFunc Função que cria o esquema
   * @param {any} dependencieKeys Chave dos esquemas necessários para
   *   o carregamento deste
   * @param {any} collectionName Nome da coleção manipulada
   *  na base de dados
   * @param {ModelFactory} factory Objeto de gerênciamento que instanciou a classe
   * @param {any} populate Dados para o preenchimento automático de
   *   documentos embutidos
   *
   * @returns ModelFactory
   */
  constructor (
    public key: any,
    public schemaFunc: any,
    public dependencieKeys: any,
    public collectionName: any,
    public factory: any,
    public populate: any,
    public config: any
  ) {
    this.model = null
    this.schema = null
  }

  /**
   * CDependências para a conversão do esquema
   *
   */
  get dependencies () {
    const obj = {} as any
    const factory = this.factory;
    (this.dependencieKeys || []).forEach((key: any) => {
      obj[key] = factory._models[key]
    })
    return obj
  }

  /**
   * Carrega e configura os objetos relacionados a base de dados
   *   de acordo com os dados da instância
   *
   * @returns {any}
   */
  init () {
    const dependencies = this.dependencies
    const key = this.key
    const schema = this.schemaFunc({ ...this, dependencies })
    const populate = (this.populate = this.loadPopulate(this.populate, schema))
    const autoPopulate = this.getAutoPopulate(populate)
    if (autoPopulate) {
      schema.pre('findOne', autoPopulate).pre('find', autoPopulate)
    }
    this.schema = schema
    const collectionName = this.collectionName
    try {
      if (collectionName) {
        this.model = mongoose.model(key, schema, collectionName)
      } else {
        this.model = mongoose.model(key, schema)
      }
    } catch (err) {
      this.model = mongoose.model(key)
    } finally {
      const model = this.model
      this.collectionName =
        this.collectionName || (model && model.collection)
          ? model.collection.collectionName
          : null
    }
    return this
  }

  /**
   * Carrega o preenchimento automático de documentos embutidos
   *   de acordo com os dados da instância
   *
   * @param {any} model Esquema a ser carregado
   *
   * @returns {any}
   */
  loadPopulate (populate: any, schema: any): any {
    if (!populate) {
      return null
    }
    const result = populate.map((obj: any) => {
      // se o objeto for um texto, esse texto refere ao caminho a ser populado
      if (typeof obj === 'string') {
        obj = { path: obj }
      }
      // se o objeto tiver o nome da collection, nao precisa ser alterado, pois ja tem o nome da coleção
      if (obj.collectionName) {
        return obj
      }
      // se não for definido a referencia ele pega do schema
      const ref =
        obj.ref ||
        (schema.path(obj.path) ? schema.path(obj.path).options.ref : null)
      // Procura o wrapper que está sendo referenciado
      const wrapper = this.dependencies[ref]
      // adiciona o nome da coleção a dependência
      const collectionName = wrapper
        ? wrapper.model.collection.collectionName
        : null
      return {
        ...obj,
        collectionName
      }
    }) // map

    return result
  }

  /**
   * Gera os dados de preenchimento automático de documentos embutidos
   *   pela chave
   *
   * @param {any} populate Dados do preenchimento automático
   *
   * @returns {any}
   */
  getAutoPopulate (populate: any): any {
    if (!populate) {
      return null
    }
    return (next: any) => {
      if (populate) {
        populate.forEach((obj: any) => {
          const { ref, collectionName, ...params } = obj
          try {
            this.populate(params) // obj.path
          } catch (err) {}
        })
      }
      next()
    }
  }
}
