import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  signup = async (dto: AuthDto) => {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('Email already in use');
        }
        throw e;
      }
    }
  };

  signin = async (dto: AuthDto) => {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Email not found');
    const pMatch = await argon.verify(user.hash, dto.password);
    if (!pMatch) throw new ForbiddenException('Password does not match');

    return this.signToken(user.id, user.email);
  };

  signToken = async (
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> => {
    const payload = {
      sub: userId, 
      email,
    };

    const jwt = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: jwt,
    };
  };
}
