import { DTO } from './DTO'

export class Schema extends DTO {
    _id?: String
    __v?: Number
    createdAt?: String
    updatedAt?: String

    fromJson (json: any): any {
      if (!json) { return this }
      try {
        json = (typeof json === 'string') ? JSON.parse(json) : json
        this.assign(this, json)
      } catch (err) {
        if (DTO.isId(json)) {
          this._id = json
        }
      }
      return this
    }
}
