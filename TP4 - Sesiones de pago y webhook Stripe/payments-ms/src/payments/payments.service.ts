import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { orderId, currency, items } = paymentSessionDto;

    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        // Stripe trabaja en la unidad minima de la moneda (centavos).
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // La metadata del PaymentIntent se copia a la Charge, asi el webhook
      // charge.succeeded puede leer el orderId.
      payment_intent_data: {
        metadata: { orderId },
      },
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    this.logger.log(`Checkout Session ${session.id} creada para orden ${orderId}`);

    return session;
  }

  handleWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Webhook Error: missing body or stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        envs.stripeEndpointSecret,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Firma de webhook invalida: ${message}`);
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    switch (event.type) {
      case 'charge.succeeded': {
        const charge = event.data.object;
        const orderId = charge.metadata.orderId;
        this.logger.log(
          `charge.succeeded -> orderId: ${orderId} | charge: ${charge.id} | monto: ${charge.amount / 100} ${charge.currency.toUpperCase()}`,
        );
        break;
      }
      default:
        this.logger.log(`Evento ${event.type} no manejado`);
    }

    return { received: true };
  }
}
