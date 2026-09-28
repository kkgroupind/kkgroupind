import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteTagline?: string;

  @IsOptional()
  @IsString()
  siteTaglineMl?: string;

  @IsOptional()
  @IsString()
  primaryDistrict?: string;

  @IsOptional()
  @IsString()
  operatingAreas?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  whatsappPhone?: string;

  @IsOptional()
  @IsString()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  officeAddress?: string;

  @IsOptional()
  @IsString()
  businessHours?: string;

  @IsOptional()
  @IsBoolean()
  emergencyDispatch?: boolean;

  @IsOptional()
  @IsBoolean()
  publicEnquiries?: boolean;

  @IsOptional()
  @IsBoolean()
  multilingualEnabled?: boolean;

  @IsOptional()
  @IsString()
  announcementBanner?: string;

  @IsOptional()
  @IsBoolean()
  bannerActive?: boolean;
}
