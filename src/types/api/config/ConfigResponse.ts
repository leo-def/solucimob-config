import { DTO } from '../../../abstracts/DTO'

/**
 * Retorno da consulta da configuração
 * @typedef {Object} ConfigResposne
 * @property {String} valorM2 Valor do metro quadrado.
 */
export class ConfigResponse extends DTO {
  valorM2: number;

  constructor (defaultValues?: any) {
    super()
    if (defaultValues) {
      this.load(defaultValues, this)
    }
  }

  toDTO () {
    const { valorM2 } = this
    return {
      valorM2
    }
  }
}
