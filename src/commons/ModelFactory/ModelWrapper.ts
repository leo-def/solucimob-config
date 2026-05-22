import mongoose from 'mongoose'

/**
 * Encapsulation of schema-related values to centralize access and avoid coupling.
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
   * @param {any} key Schema identification key
   * @param {any} schemaFunc Function that creates the schema
   * @param {any} dependencieKeys Keys of schemas required for loading this schema
   * @param {any} collectionName Name of the database collection
   * @param {ModelFactory} factory Management object that instantiated the class
   * @param {any} populate Data for automatic populate of embedded documents
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
   * Dependencies required for converting the schema.
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
   * Loads and configures the database-related objects based on instance data.
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
   * Loads the automatic populate of embedded documents based on instance data.
   *
   * @param {any} model Schema to be loaded
   *
   * @returns {any}
   */
  loadPopulate (populate: any, schema: any): any {
    if (!populate) {
      return null
    }
    const result = populate.map((obj: any) => {
      // If the object is a string, it represents the path to be populated
      if (typeof obj === 'string') {
        obj = { path: obj }
      }
      // If the object already contains the collectionName, it does not need modification
      if (obj.collectionName) {
        return obj
      }
      // If ref is not defined, retrieve it from the schema path options
      const ref =
        obj.ref ||
        (schema.path(obj.path) ? schema.path(obj.path).options.ref : null)
      // Look up the wrapper that is being referenced
      const wrapper = this.dependencies[ref]
      // Add the collection name to the dependency details
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
   * Generates the automatic populate data for embedded documents by key.
   *
   * @param {any} populate Automatic populate data
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
