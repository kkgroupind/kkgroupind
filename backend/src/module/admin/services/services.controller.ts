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
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../common';
import { Role } from '../../../database';
import { ServicesService } from './services.service';
import { CreateServiceDto, ListServicesDto, UpdateServiceDto } from './dto';

@Controller('admin/services')
@Roles(Role.SUPER_ADMIN)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  @Get()
  async listServices(@Query() dto: ListServicesDto) {
    return this.servicesService.listServices(dto);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedServices() {
    return this.servicesService.seedDefaultServices();
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }

  @Patch(':id')
  async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.updateService(id, dto);
  }

  @Patch(':id/toggle-status')
  async toggleServiceStatus(@Param('id') id: string) {
    return this.servicesService.toggleServiceStatus(id);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
}
