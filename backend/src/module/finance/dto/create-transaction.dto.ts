import {
  IsEnum,
  IsNotEmpty,
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

export class CreateTransactionDto {
  @IsEnum(TransactionType, { message: FINANCE_MESSAGES.TYPE_REQUIRED })
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionCategory, { message: FINANCE_MESSAGES.CATEGORY_REQUIRED })
  @IsNotEmpty()
  category: TransactionCategory;

  @IsNumber({}, { message: FINANCE_MESSAGES.AMOUNT_POSITIVE })
  @IsPositive({ message: FINANCE_MESSAGES.AMOUNT_POSITIVE })
  amount: number;

  @IsString({ message: FINANCE_MESSAGES.DATE_REQUIRED })
  @IsNotEmpty({ message: FINANCE_MESSAGES.DATE_REQUIRED })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' })
  date: string; // YYYY-MM-DD

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.CASH;

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
