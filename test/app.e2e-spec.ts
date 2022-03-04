import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => app.close());
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'davidmanolo_97@hotmail.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw if email empty', () =>
        pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: '', password: '123' })
          .expectStatus(400));
      it('should throw if password empty', () =>
        pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email, password: '' })
          .expectStatus(400));
      it('should throw if not body provided', () =>
        pactum.spec().post('/auth/signup').expectStatus(400));
      it('should signup', () =>
        pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201));
    });
    describe('Singin', () => {
      it('should throw if email empty', () =>
        pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: '', password: '123' })
          .expectStatus(400));
      it('should throw if password empty', () =>
        pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email, password: '' })
          .expectStatus(400));
      it('should throw if not body provided', () =>
        pactum.spec().post('/auth/signin').expectStatus(400));
      it('should signin', () =>
        pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200));
    });
  });
  describe('User', () => {
    describe('Get me', () => {});
    describe('Edit User', () => {});
  });

  describe('Bookmarks', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
