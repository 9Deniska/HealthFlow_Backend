import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { LiqpayService } from './liqpay.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { LiqpayCallbackDto } from './dto/liqpay.entity';

@Controller('liqpay')
export class LiqpayController {
  constructor(
    private readonly liqpayService: LiqpayService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Post('callback')
  @ApiBody({ type: LiqpayCallbackDto })
  async handleCallback(@Body() body: LiqpayCallbackDto) {
      const { data, signature } = body;

      const isValid = this.liqpayService.verifySignature(data, signature);
      if (!isValid) {
          return { status: 'invalid signature' };
      }

      const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

      if (decoded.status === 'success' || decoded.status === 'sandbox') {
          const appointmentId = decoded.order_id;
          try {
              await this.appointmentsService.markAsPaid(appointmentId);
              return { status: 'ok' };
          } catch (error) {
              return { status: 'error', message: error.message };
          }
      }

      return { status: 'payment not successful' };
  }

  @Get('generate')
  generatePayment(
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
    @Query('description') description: string,
  ) {
    return this.liqpayService.generatePayment(orderId, +amount, description);
  }
}
