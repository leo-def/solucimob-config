import { ModelWrapper } from './ModelWrapper'
export { ModelWrapper } from './ModelWrapper'

/**
 * Gerência objetos para persistência na base de dados
 *
 * @name ModelFactory
 * @module commons/ModelFactory
 * @category Commons
 * @subcategory ModelFactory
 */
export class ModelFactory {
  static instance: ModelFactory;
  _models: any = {} as any;
  _waiting: any = {} as any;
  _dependencies: any = {} as any;

  /**
   * Retorna uma instância da classe ModelFactory
   *
   * @param {any} config Configuração da instância
   *
   * @returns {ModelFactory}
   *
   */
  static getInstance (config?: any): any {
    return (ModelFactory.instance =
      !!ModelFactory.instance && !config
        ? ModelFactory.instance
        : new ModelFactory(config))
  }

  /**
   * Retorna o objeto solicitado caso caso encontrado
   *
   * @param {any} model Objeto solicitado
   * @param {boolean} throwError Indica se deve lançar um erro
   *                    caso o objeto não seja encontrado
   *
   * @returns {any}
   */
  static getModel (model: any, throwError: boolean = true) {
    const modelWrapper = ModelFactory.instance
      ? ModelFactory.instance.getModel(model)
      : null
    if (!modelWrapper && throwError) {
      throw new Error(
        `Não foi possível carregar a persistência do modelo ${model}.`
      )
    }
    return modelWrapper
  }

  /**
   * @constructor
   *
   * @param {any} args  Objeto de configuração da instância
   *
   * @returns ModelFactory
   */
  constructor (config: any) {
    if (config.list) {
      this.loadList(config.list)
    }
    if (config.folder) {
      // this.loadFolder(config.folder);
    }
  }

  /**
   * Objetos carregados
   */
  get models (): any {
    return this.cleanObj(this._models)
  }

  /**
   * Objetos na fila de espera
   */
  get waiting (): any {
    return this.cleanObj(this._waiting)
  }

  /**
   * Dependências
   */
  get dependencies (): any {
    return this.cleanObj(this._dependencies)
  }

  /**
   * Retira valores indesejados de um objeto
   *
   * @param {any} obj Objeto a ser limpado
   *
   * @returns {any}
   * @todo mover para uma classe mais genérica
   */
  cleanObj (obj: any): any {
    const result = {} as any
    for (const index in obj) {
      let val = obj[index]
      if (val) {
        val = typeof val === 'object' ? this.cleanObj(val) : val
        result[index] = val
      }
    }
    return result
  }

  /**
   * Retorna o objeto solicitado caso caso encontrado
   *
   * @param {any} model Objeto solicitado
   *
   * @returns {any}
   */
  getModel (model: any): any {
    return this._models[model.key || model]
  }

  /**
   * Carrega uma lista de esquemas no objeto de gerênciamento
   *    para depois ser carregado como objeto de persistência
   *
   * @param {any} param Esquemas a serem carregados
   *
   * @returns {any}
   */
  loadList (param: any): any {
    for (let key in param) {
      const schema = param[key]
      key = Number.isNaN(key) ? key : schema.key
      this.loadSchema({ ...schema, key })
    }
  }

  /**
   * Carrega um esquema no objeto de gerênciamento
   *    para depois ser carregado como objeto de persistência
   *
   * @param {any} schemaWrapper Esquema a ser carregado
   *
   * @returns {any}
   */
  loadSchema (schemaWrapper: any): any {
    const {
      key,
      schemaFunc,
      dependencies,
      dependencieKeys,
      collectionName,
      populate,
      config
    } = schemaWrapper
    const model = new ModelWrapper(
      key,
      schemaFunc,
      dependencies || dependencieKeys,
      collectionName,
      this,
      populate,
      config
    )
    this.loadModel(model)
  }

  /**
   * Se possível converte o esquema em um objeto de persistência,
   *   senão, coloca na fila de espera
   *
   * @param {any} schemaWrapper Esquema a ser carregado
   *
   * @returns {any}
   */
  loadModel (model: any): any {
    if (!this.checkAndLoadDependencies(model)) {
      return
    }
    return this.setModel(model)
  }

  /**
   * Converte o esquema em um objeto de persistência
   *
   * @param {any} model Esquema a ser carregado
   *
   * @returns {any}
   */
  setModel (model: any): any {
    if (this._models[model.key]) {
      return
    }
    model.init(this)
    this._waiting[model.key] = null
    this._models[model.key] = model
    const dependencies = this._dependencies[model.key]
    if (dependencies) {
      for (const key in dependencies) {
        const obj = dependencies[key]
        if (obj) {
          this.loadModel(obj)
        }
      }
    }
    return model
  }

  /**
   * Carrega dependências do esquema, e verifica se depois disso
   *   existe alguma
   *
   * @param {any} model Esquema a ser carregado
   *
   *  @returns {boolean}
   */
  checkAndLoadDependencies (model: any): any {
    let result = true
    for (const key in model.dependencies) {
      const obj = model.dependencies[key]
      if (!obj) {
        this._dependencies[key] = this._dependencies[key] || {}
        this._dependencies[key][model.key] = model
        this._waiting[model.key] = model
        result = false
      }
    }
    return result
  }
}
