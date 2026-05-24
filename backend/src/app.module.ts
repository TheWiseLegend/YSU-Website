// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { GalleryModule } from './gallery/gallery.module';
import { BranchesModule } from './branches/branches.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { UnionTeamModule } from './union-team/union-team.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { LocalStorageModule } from './local-storage/local-storage.module';
import { MemberAuthModule } from './member-auth/member-auth.module';
import { MembersModule } from './members/members.module';
import { AdminMembersModule } from './admin-members/admin-members.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipCronModule } from './membership-cron/membership-cron.module';
import { EmailModule } from './email/email.module';
import { VendorModule } from './vendor/vendor.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NewsModule,
    PrismaModule,
    EventsModule,
    GalleryModule,
    BranchesModule,
    TeamMembersModule,
    UnionTeamModule,
    AuthModule,
    UploadModule,
    LocalStorageModule,
    MembersModule,
    MemberAuthModule,
    AdminMembersModule,
    ScheduleModule.forRoot(),
    MembershipCronModule,
    EmailModule,
    VendorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}