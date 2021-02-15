import mongoose from 'mongoose'

const Schema = mongoose.Schema
/**
 * Configuração de valores do sistema
 * @typedef {Object} Config
 * @property {String} valorM2 Valor do metro quadrado.
 */

/**
 * Função para gerar o esquema
 * @returns {Config}
 */
export const schemaFunc = (params: any) => {
  const schema = new Schema(
    {
      valorM2: Number
    },
    { timestamps: true }
  )

  return schema
}

/**
 * Chave para identificação do objeto de gerenciamento de dados
 */
export const key = 'Config'

/**
 * Dependências do modelo
 */
export const dependencies: Array<any> = []

/**
 * Campos a serem preenchidos na consulta de dados
 */
export const populate: Array<any> = []

export const modelWrapper = {
  key,
  schemaFunc,
  dependencies,
  populate
}

export default modelWrapper
