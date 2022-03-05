import { Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
@Controller('users')
export class UserController {

  constructor(private userService : UserService){}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user
  }


  @Put()
  editUser(){
    return this.userService.editUser(1)
  }
}
