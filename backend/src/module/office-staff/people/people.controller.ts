import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../../common';
import { Role } from '../../../database';
import { PeopleService } from './people.service';
import {
  CheckStaffEmailDto,
  CheckStaffUsernameDto,
  CreateStaffPersonDto,
  ListStaffPeopleDto,
  UpdateStaffPersonDto,
} from './dto';

@Controller('office-staff/people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get()
  async listPeople(@Query() query: ListStaffPeopleDto) {
    return this.peopleService.listPeople(query);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPerson(@Body() dto: CreateStaffPersonDto) {
    return this.peopleService.createPerson(dto);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get('check-username')
  async checkUsername(@Query() query: CheckStaffUsernameDto) {
    return this.peopleService.checkUsernameAvailability(query.username);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get('check-email')
  async checkEmail(@Query() query: CheckStaffEmailDto) {
    return this.peopleService.checkEmailAvailability(query.email);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Get(':username')
  async getPersonByUsername(@Param('username') username: string) {
    return this.peopleService.getPersonByUsername(username);
  }

  @Roles(Role.OFFICE_STAFF, Role.SUPER_ADMIN)
  @Patch(':id')
  async updatePerson(
    @Param('id') id: string,
    @Body() dto: UpdateStaffPersonDto,
  ) {
    return this.peopleService.updatePerson(id, dto);
  }
}
