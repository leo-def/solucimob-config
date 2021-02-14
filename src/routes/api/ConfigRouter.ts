import express from 'express'
import service from '../../services/ConfigService'


/**
 * Mapeamento de rotas para autenticação
 * @namespace
 * @name configRoutes
 *
 * @example Rota para consulta de configuração
 *     router.get('/', service.getConfig.bind(service))
 *
 */
export const configRoutes = () => {
  const router = express.Router()

  /**
   * Rota para configuração no sistema
   * @memberof configRoutes
   */
  router.get('/', service.find.bind(service))

  return router
}

export default configRoutes
