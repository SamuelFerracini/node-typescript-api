import { User } from '@src/models/user'
import bcrypt from 'bcrypt'
import config from 'config'
import jwt from 'jsonwebtoken'

export interface IDecodedUser extends Omit<User, '_id'> {
  id: string
}

export default class AuthService {
  private static secretKey = config.get<string>('App.auth.key')
  private static expiresIn = config.get<string>('App.auth.tokenExpiresIn')

  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  public static generateToken(payload: object): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn
    })
  }

  public static decodeToken(token: string): IDecodedUser {
    return jwt.verify(token, this.secretKey) as IDecodedUser
  }
}
