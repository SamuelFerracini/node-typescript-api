import { Request, Response } from 'express'

import { Controller, Post } from '@overnightjs/core'
import { User } from '@src/models/user'
import AuthService from '@src/services/auth'

@Controller('auth')
export class AuthController {
  @Post('login')
  public async login(req: Request, res: Response) {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) return res.status(401).send({ error: 'Not authorized' })

    const isSamePassword = await AuthService.comparePasswords(
      password,
      user.password
    )

    if (!isSamePassword)
      return res.status(401).send({ error: 'Not authorized' })

    const token = AuthService.generateToken(user.toJSON())

    return res.send({ token })
  }
}
