import getEnv from '../env'
import { ModelFactory } from '../commons/ModelFactory'

export class InitConfig {
  static async init () {
    const env = getEnv()
    const configWrapper = ModelFactory.getModel('Config')
    if (!configWrapper) {
      throw new Error(
        'Não foi possível carregar a persistência do modelo Config.'
      )
    }
    const configModel = configWrapper.model
    const config = env.config
    const result = await configModel.findOne().exec()
    if (!result) {
      return configModel.create(config)
    }
    return null
  } // init
}
