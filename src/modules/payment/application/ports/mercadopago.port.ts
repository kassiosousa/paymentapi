export type MercadoPagoPreferenceResult = {
  preferenceId: string;
  initPoint?: string;
};

export type MercadoPagoPaymentStatus = 'approved' | 'rejected' | 'pending' | 'unknown';

export interface MercadoPagoPort {
  createPreference(input: {
    externalReference: string;
    description: string;
    amount: number;
    payerCpf: string;
    notificationUrl: string;
  }): Promise<MercadoPagoPreferenceResult>;

  getPaymentStatusByNotification(input: { topic?: string; id?: string }): Promise<MercadoPagoPaymentStatus>;
}
