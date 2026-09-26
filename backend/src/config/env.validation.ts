import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(5000),

  DATABASE_URL: Joi.string()
    .uri()
    .required(),

  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000'),

  JWT_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_EXPIRES_IN: Joi.string()
    .default('7d'),

  SUPER_ADMIN_EMAIL: Joi.string()
    .email()
    .default('admin@kkgroup.com'),

  SUPER_ADMIN_USERNAME: Joi.string()
    .default('superadmin'),

  SUPER_ADMIN_PASSWORD: Joi.string()
    .default('AdminPassword@123'),

  APP_EMAIL: Joi.string().email().allow('', null),
  APP_PASSWORD: Joi.string().allow('', null),

  SMTP_HOST: Joi.string().allow('', null),
  SMTP_PORT: Joi.number().allow('', null).default(587),
  SMTP_USER: Joi.string().allow('', null),
  SMTP_PASS: Joi.string().allow('', null),
  SMTP_FROM: Joi.string().allow('', null).default('"KK Group" <noreply@kkgroup.com>'),

  CLOUDINARY_APP_NAME: Joi.string().allow('', null),
  CLOUDINARY_KEY_NAME: Joi.string().allow('', null),
  CLOUDINARY_API_KEY: Joi.string().allow('', null),
  CLOUDINARY_API_SECRET: Joi.string().allow('', null),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().allow('', null),
});