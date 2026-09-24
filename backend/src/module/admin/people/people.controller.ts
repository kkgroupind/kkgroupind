import {
  Body,
  Controller,
  Delete,
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
  CheckEmailDto,
  CheckUsernameDto,
  CreatePersonDto,
  ListPeopleDto,
  UpdatePersonDto,
} from './dto';

@Controller(['admin/people', 'people'])
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Roles(Role.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPerson(@Body() dto: CreatePersonDto) {
    return this.peopleService.createPerson(dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get()
  async listPeople(@Query() query: ListPeopleDto) {
    return this.peopleService.listPeople(query);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('check-username')
  async checkUsername(@Query() query: CheckUsernameDto) {
    return this.peopleService.checkUsernameAvailability(query.username);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('check-email')
  async checkEmail(@Query() query: CheckEmailDto) {
    return this.peopleService.checkEmailAvailability(query.email);
  }

  @Roles(Role.SUPER_ADMIN, Role.OFFICE_STAFF)
  @Get(':username')
  async getPersonByUsername(@Param('username') username: string) {
    return this.peopleService.getPersonByUsername(username);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  async updatePerson(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.peopleService.updatePerson(id, dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async deletePerson(@Param('id') id: string) {
    return this.peopleService.deletePerson(id);
  }
}
