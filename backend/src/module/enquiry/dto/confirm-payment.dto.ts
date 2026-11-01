import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../../database';
import { VALIDATION_MESSAGES } from '../../../common';

export class ConfirmPaymentDto {
  @IsNumber({}, { message: VALIDATION_MESSAGES.PAYMENT_AMOUNT_POSITIVE })
  @Min(1, { message: VALIDATION_MESSAGES.PAYMENT_AMOUNT_POSITIVE })
  amount: number;

  @IsEnum(PaymentMethod, { message: VALIDATION_MESSAGES.PAYMENT_METHOD_REQUIRED })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

