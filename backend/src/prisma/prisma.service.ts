import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config'


@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
      super({
        datasources: {
          db:{
            url: config.get('DATABASE_URL'),
          }
        }
      });
    }

    cleanDb(){
      return this.$transaction([
        this.teamMember.deleteMany(),
        this.branch.deleteMany(),
        this.galleryImage.deleteMany(),
        this.gallery.deleteMany(),
        this.event.deleteMany(),
        this.news.deleteMany(),
        this.unionTeamMember.deleteMany(),
      ]);
    }
  }
