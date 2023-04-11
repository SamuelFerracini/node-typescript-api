import mongoose, { Document, Schema } from 'mongoose'

export enum EBeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface IBeach {
  _id?: string
  name: string
  position: EBeachPosition
  lat: number
  lng: number
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      }
    }
  }
)

interface IBeachModel extends Omit<IBeach, '_id'>, Document {}

export const Beach = mongoose.model<IBeachModel>('Beach', schema)
