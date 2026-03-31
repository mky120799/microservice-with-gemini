import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'common-lib' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
