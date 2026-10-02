import { Module } from '@nestjs/common';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { PeopleRepository } from './people.repository';
import { PrismaModule } from '../../../database/prisma.module';
import { ReminderModule } from '../../reminder/reminder.module';

@Module({
  imports: [PrismaModule, ReminderModule],
  controllers: [PeopleController],
  providers: [PeopleRepository, PeopleService],
  exports: [PeopleRepository, PeopleService],
})
export class PeopleModule {}

