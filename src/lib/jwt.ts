/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */

import { readFileSync } from 'fs'
import jwtlib from 'jsonwebtoken'
import { config } from '..'


export default class JWT {

  private static readonly privateKey = JWT.readFileSave('/jwt.private.key')
  private static readonly publicKey = JWT.readFileSave('/jwt.public.key')

  private static readFileSave(url: string): Buffer {
    try {
      return readFileSync(config.security.vaultFolder + url)
    } catch (ex) {
      console.error(ex.message)
      return null
    }
  }

  public static get loadedSuccessfully(): boolean {
    return !!this.privateKey
  }

  //

  public static signRaw(payload: object, options: jwtlib.SignOptions = {}): Promise<string> {
    return new Promise(res => jwtlib.sign(payload, this.privateKey, options, (_err, token) => res(token)))
  }

  public static decodeRaw(token: string, allowUnsigned = false): Promise<Record<string, any> | undefined> {
    if (allowUnsigned)
      return new Promise(res => res(jwtlib.decode(token, { json: true })))
    // @ts-ignore
    return new Promise(res => jwtlib.verify(token, this.privateKey, {}, (_err, decoded) => res(decoded)))
  }

}
