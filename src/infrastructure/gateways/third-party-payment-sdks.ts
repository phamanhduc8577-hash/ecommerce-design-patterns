import {
  IVNPayGateway,
  VNPayGatewayParams,
  VNPayGatewayResponse,
  IMoMoGateway,
  MoMoGatewayPayload,
  MoMoGatewayResponse
} from '../../domain/patterns/structural/adapter/payment-gateway.interfaces';

/**
 * Thư viện SDK giả lập của bên thứ ba (VNPay Payment Gateway).
 * Tầng Infrastructure `implements` port `IVNPayGateway` của tầng Domain (DIP: phụ thuộc vào trong).
 */
export class ExternalVNPaySdk implements IVNPayGateway {
  public doPaymentGateway(vnpParams: VNPayGatewayParams): VNPayGatewayResponse {
    // Giả lập xử lý thanh toán phía máy chủ VNPay
    return {
      code: '00', // 00 là mã thành công của VNPay
      vnp_TransactionNo: `VNPAY${Math.floor(Math.random() * 900000 + 100000)}`,
      message: `Thanh toán qua cổng VNPay thành công cho mã GD ${vnpParams.vnp_TxnRef}`
    };
  }
}

/**
 * Thư viện SDK giả lập của bên thứ ba (MoMo Wallet Gateway).
 * Tầng Infrastructure `implements` port `IMoMoGateway` của tầng Domain (DIP).
 */
export class ExternalMoMoSdk implements IMoMoGateway {
  public executeMoMoTransaction(payload: MoMoGatewayPayload): MoMoGatewayResponse {
    // 0 là mã thành công của MoMo
    return {
      status: 0,
      transId: `MOMO${Math.floor(Math.random() * 90000000 + 10000000)}`,
      message: `Giao dịch ví MoMo hoàn tất cho đơn ${payload.orderId}`
    };
  }
}
