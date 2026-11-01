/**
 * Thư viện SDK giả lập của bên thứ ba (VNPay Payment Gateway)
 * Có định dạng dữ liệu và tên hàm khác hoàn toàn với hệ thống của chúng ta.
 */
export class ExternalVNPaySdk {
  public doPaymentGateway(vnpParams: {
    vnp_TmnCode: string;
    vnp_Amount: number;
    vnp_OrderInfo: string;
    vnp_TxnRef: string;
  }): { code: string; vnp_TransactionNo: string; message: string } {
    // Giả lập xử lý thanh toán phía máy chủ VNPay
    return {
      code: '00', // 00 là mã thành công của VNPay
      vnp_TransactionNo: `VNPAY${Math.floor(Math.random() * 900000 + 100000)}`,
      message: `Thanh toán qua cổng VNPay thành công cho mã GD ${vnpParams.vnp_TxnRef}`
    };
  }
}

/**
 * Thư viện SDK giả lập của bên thứ ba (MoMo Wallet Gateway)
 */
export class ExternalMoMoSdk {
  public executeMoMoTransaction(payload: {
    partnerCode: string;
    orderId: string;
    amount: number;
    orderInfo: string;
  }): { status: number; transId: string; message: string } {
    // 0 là mã thành công của MoMo
    return {
      status: 0,
      transId: `MOMO${Math.floor(Math.random() * 90000000 + 10000000)}`,
      message: `Giao dịch ví MoMo hoàn tất cho đơn ${payload.orderId}`
    };
  }
}
