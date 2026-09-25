import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payments-ms');

  // rawBody: true guarda el cuerpo sin parsear en req.rawBody, que es lo que
  // necesita Stripe para verificar la firma del webhook.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(envs.port);
  logger.log(`Payments MS corriendo en http://localhost:${envs.port}`);
}
bootstrap();
