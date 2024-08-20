import {KafkaOptions, MicroserviceOptions, Transport} from "@nestjs/microservices";

process.env.TZ = 'Asia/Seoul';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

export const KAFKA_OPTION: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: "raffle",
      brokers: ["210.109.53.237:9092"],
    },
    consumer: {
      groupId: "group_1",
    },
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('raffle');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
      .setTitle('Raffle-swagger')
      .setDescription('raffle service API description')
      .setVersion('1.0')
      //.addServer('/raffle')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('raffle/swagger', app, document);
  app.enableCors();
  /*
  app.enableCors({
    origin: ['https://example1.com', 'https://example2.com'], // 허용할 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 HTTP 메서드
    credentials: true, // 자격 증명(쿠키 등) 허용 여부
  });
  */
  app.connectMicroservice<MicroserviceOptions>(KAFKA_OPTION);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port || 3000);
}
bootstrap();