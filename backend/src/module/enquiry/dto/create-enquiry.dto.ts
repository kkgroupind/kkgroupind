import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnquiryDto {
  @IsString()
  @IsNotEmpty({ message: 'Service name is required' })
  serviceName: string;

  @IsString()
  @IsNotEmpty({ message: 'Your name is required' })
  customerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  customerPhone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  customerEmail?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  mapUrl?: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsString()
  @IsNotEmpty({ message: 'Enquiry message / details are required' })
  message: string;
}
