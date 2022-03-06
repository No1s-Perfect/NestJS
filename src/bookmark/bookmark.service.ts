import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}
  getBookMarks = async (userId: number) =>
    await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });

  getBookMarkById = async (userId: number, bookmarkId: number) =>
    await this.prismaService.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

  createBookmark = async (userId: number, dto: CreateBookmarkDto) =>
    await this.prismaService.bookmark.create({
      data: {
        ...dto,
        userId,
      },
    });

  editBookMarkById = async (
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) => {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access denided');
    return this.prismaService.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  };

  deleteBookMarkById = async (userId: number, bookmarkId: number) => {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  };
}
