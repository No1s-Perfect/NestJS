import { Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  
  
  signin() {
    PrismaService;
    return 'fuck u bitch';
  }
  
  signup() {
    return ' yea bitch fuck u';
  }
}
