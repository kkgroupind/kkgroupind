import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import {
  PaymentMethod,
  TransactionCategory,
  TransactionType,
} from '../../../database';
import { FINANCE_MESSAGES } from '../../../common';

export class UpdateTransactionDto {
  @IsEnum(TransactionType, { message: FINANCE_MESSAGES.TYPE_REQUIRED })
  @IsOptional()
  type?: TransactionType;

  @IsEnum(TransactionCategory, { message: FINANCE_MESSAGES.CATEGORY_REQUIRED })
  @IsOptional()
  category?: TransactionCategory;

  @IsNumber({}, { message: FINANCE_MESSAGES.AMOUNT_POSITIVE })
  @IsPositive({ message: FINANCE_MESSAGES.AMOUNT_POSITIVE })
  @IsOptional()
  amount?: number;

  @IsString({ message: FINANCE_MESSAGES.DATE_REQUIRED })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  @IsOptional()
  date?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  enquiryId?: string;

  @IsString()
  @IsOptional()
  workerId?: string;
}
