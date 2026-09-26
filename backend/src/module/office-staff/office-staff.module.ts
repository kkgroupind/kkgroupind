import { Module } from '@nestjs/common';
import { OfficeStaffProfileModule } from './profile/profile.module';
import { OfficeStaffPeopleModule } from './people/people.module';

@Module({
  imports: [OfficeStaffProfileModule, OfficeStaffPeopleModule],
  exports: [OfficeStaffProfileModule, OfficeStaffPeopleModule],
})
export class OfficeStaffModule {}
