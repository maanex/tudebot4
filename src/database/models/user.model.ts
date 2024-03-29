/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type UserDataType = {
  _id: string
  achievements: {
    name: string
    unlocked: number | null
    counter?: number
    collected?: string[]
  }[]
}

/** The user mongoose object, muteable and saveable */
export type UserType = UserDataType & { queueSave(): void } & MongooseDocument<any, {}>


// ===== MONGO SCHEMA ===== //


export const UserSchema = new Schema({
  _id: String,
  achievements: [ {
    name: { type: String, required: true },
    unlocked: { type: Number, default: null },
    counter: { type: Number, required: false },
    collected: { type: [ String ], required: false }
  } ]
}, { collection: 'users' })
