import { Request, Response } from 'express'

import { Controller, Post } from '@overnightjs/core'

import AuthService from '@src/services/auth'
import { User } from '@src/models/user'
import { BaseController } from '.'

@Controller('auth')
export class AuthController extends BaseController {
  @Post('login')
  public async login(req: Request, res: Response) {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Not authorized'
      })

    const isSamePassword = await AuthService.comparePasswords(
      password,
      user.password
    )

    if (!isSamePassword)
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Not authorized'
      })

    const token = AuthService.generateToken(user.toJSON())

    return res.send({ token })
  }
}
