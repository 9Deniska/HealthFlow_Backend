import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class LiqpayService {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor() {
    this.publicKey = process.env.LIQPAY_PUBLIC_KEY || '';
    this.privateKey = process.env.LIQPAY_PRIVATE_KEY || '';
  }

  generatePayment(orderId: string, amount: number, description: string) {
    const payload = {
      public_key: this.publicKey,
      version: '3',
      action: 'pay',
      amount,
      currency: 'UAH',
      description,
      order_id: orderId,
      sandbox: 1,
      result_url: 'healthflow://main',
      server_url: 'https://healthflowbackend-production.up.railway.app/api/liqpay/callback',
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.getSignature(data);

    return { data, signature };
  }

  private getSignature(data: string): string {
    return crypto
      .createHash('sha1')
      .update(this.privateKey + data + this.privateKey)
      .digest('base64');
  }

  verifySignature(data: string, receivedSignature: string): boolean {
    const expected = this.getSignature(data);
    return expected === receivedSignature;
  }
}
