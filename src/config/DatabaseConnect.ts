import mongoose from 'mongoose'
import bluebird from 'bluebird'
import getEnv from '../env'
import { LoggerService } from './logger/LoggerService'
import { MongoMemoryServer } from 'mongodb-memory-server'

export const connect = async () => {
  const env = getEnv()
  const uri = await getDbUri(env)
  mongoose.Promise = bluebird
  const logger = LoggerService.getLogger()
  /**
   * Configuração da conexão
   * @memberof connect
   * @example
   * var config = {
   * URI: 'mongodb://mongodb-ip/magic',
   * OPTIONS: {
   *     user: 'tarcher',
   *     pass: 'SUPERSECRETPASSWORD',
   *     auth: {
   *       authdb: 'magic'
   *     }
   *   }
   * }
   * db.init(config.URI, config.OPTIONS);
   * const CONFIG = {
   *   useUnifiedTopology: true,
   *   useNewUrlParser: true
   *   useMongoClient: true, user: 'root',  pass: 'pass'
   * }
   */
  const CONFIG = {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }

  /**
   * Conexão com a base de dados
   * @memberof connect
   * @example
   * mongoose.connect(
   *   'mongodb://user:password@sample.com:port/dbname',
   *   { useNewUrlParser: true })
   */
  const client = mongoose.connect(uri, CONFIG)

  /**
   * Inicia o banco em modo debug
   * @memberof connect
   */
  if (env.env === 'development') {
    mongoose.set('debug', false)
  }

  /**
   * Função para ser executada quando a conexão e feita
   * @memberof connect
   */
  mongoose.connection.on('connected', function () {
    logger.info('mongoose connected')
  })

  /**
   * Função para ser executada quando a conexão e finalizada
   * @memberof connect
   */
  mongoose.connection.on('disconnected', function () {
    logger.info('mongoose disconnected')
  })

  /**
   * Função para ser executada quando houver erro de conexão
   * @memberof connect
   */
  mongoose.connection.on('error', (err: any) => {
    logger.info('mongoose error: ' + err)
  })

  /**
   * Finaliza a conexão com o banco quando o App é encerrado
   * @memberof connect
   */
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      logger.info('Mongoose, disconnected by application')
    })
  })

  return { client }
}

export const getDbUri = async (env) => {
  if (env.env === 'test') {
    const mongod = new MongoMemoryServer()
    const uri = await mongod.getUri()
    return uri
  }
  return env.db
}

/**
 * Conexão com o banco de dados
 *
 * @name Auth
 * @module config/Database
 * @category Config
 * @subcategory Database
 */
export class DatabaseConnect {
  /**
   * Função de conexão com o banco de dados
   * @namespace
   */
  static connect () {
    return connect()
  }
}
