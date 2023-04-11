import { Controller, Post } from '@overnightjs/core'
import { Response, Request } from 'express'
import { User } from '@src/models/user'
import { BaseController } from '.'

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response) {
    try {
      const user = new User(req.body)

      const newUser = await user.save()

      return res.status(201).send(newUser)
    } catch (error) {
      return this.sendCreateUpdateErrorResponse(res, error)
    }
  }
}
