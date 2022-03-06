import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { UserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
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
        pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token'));
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () =>
        pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200));
    });

    describe('Edit User', () =>
      it('should edit user', () => {
        const dto: UserDto = {
          firstName: 'tupa',
          email: 'd@gmail.com',
        };
        return pactum
          .spec()
          .put('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      }));
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () =>
        pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]));
    });

    describe('Create bookmark', () =>
      it('should create bookmark', () =>
        pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            title: 'first bookmark',
            link: 'www.google.com',
          } as CreateBookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')));
    describe('Get bookmarks', () =>
      it('should get bookmarks', () =>
        pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1)));
    describe('Get bookmark by id', () =>
      it('should get bookmark by id', () =>
        pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')));
    describe('Edit bookmark by id', () =>
      it('should edit a bookmark', () =>
        pactum
          .spec()
          .put('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody({
            title: 'fuck you',
            description: 'asdasd',
          } as EditBookmarkDto)
          .expectStatus(200)));
    describe('Delete bookmark by id', () =>
      it('should delete a bookmark', () =>
        pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)));
  });
});
