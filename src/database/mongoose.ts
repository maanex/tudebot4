import * as mongoose from 'mongoose'
import { UserSchema } from './models/user.model'


export default class Mongo {

  public static connection: mongoose.Connection;

  public static User = mongoose.model('User', UserSchema)

  //

  public static connect(url?: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.connection = mongoose.connection
      mongoose.connect(url)
      this.connection.on('error', reject)
      this.connection.on('open', () => resolve(this.connection))
    })
  }

  public static disconnect(): void {
    this.connection.close()
  }

}
