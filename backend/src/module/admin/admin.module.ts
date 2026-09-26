import { Module } from '@nestjs/common';
import { PeopleModule } from './people/people.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [PeopleModule, DashboardModule, ProfileModule, ServicesModule],
  exports: [PeopleModule, DashboardModule, ProfileModule, ServicesModule],
})
export class AdminModule {}


