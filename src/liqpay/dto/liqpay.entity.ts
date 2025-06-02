import { ApiProperty } from '@nestjs/swagger';

export class LiqpayCallbackDto {
  @ApiProperty()
  data: string;

  @ApiProperty()
  signature: string;
}
