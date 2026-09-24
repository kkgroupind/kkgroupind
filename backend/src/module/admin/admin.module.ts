import { Module } from '@nestjs/common';
import { PeopleModule } from './people/people.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [PeopleModule, DashboardModule, ProfileModule],
  exports: [PeopleModule, DashboardModule, ProfileModule],
})
export class AdminModule {}


