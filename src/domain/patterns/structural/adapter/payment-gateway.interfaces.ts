/**
 * Cổng (Port) định nghĩa TẠI tầng Domain cho các SDK thanh toán bên thứ ba.
 *
 * Tuân thủ Dependency Inversion Principle (DIP): tầng Domain KHÔNG phụ thuộc vào
 * lớp cụ thể ở tầng Infrastructure. Thay vào đó, Adapter chỉ phụ thuộc các interface
 * trừu tượng dưới đây; lớp SDK thật (`ExternalVNPaySdk`, `ExternalMoMoSdk`) ở tầng
 * Infrastructure sẽ `implements` chúng — mũi tên phụ thuộc đảo đúng chiều (ngoài -> trong).
 *
 * Các interface này cố ý giữ nguyên hình dạng dữ liệu "lạ" của từng đối tác để bài toán
 * Adapter vẫn còn ý nghĩa: Adapter vẫn phải phiên dịch chuẩn đối tác về `IPaymentProcessor`.
 */

export interface VNPayGatewayResponse {
  code: string;
  vnp_TransactionNo: string;
  message: string;
}

export interface VNPayGatewayParams {
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_OrderInfo: string;
  vnp_TxnRef: string;
}

/** Port cho cổng VNPay. */
export interface IVNPayGateway {
  doPaymentGateway(vnpParams: VNPayGatewayParams): VNPayGatewayResponse;
}

export interface MoMoGatewayResponse {
  status: number;
  transId: string;
  message: string;
}

export interface MoMoGatewayPayload {
  partnerCode: string;
  orderId: string;
  amount: number;
  orderInfo: string;
}

/** Port cho cổng MoMo. */
export interface IMoMoGateway {
  executeMoMoTransaction(payload: MoMoGatewayPayload): MoMoGatewayResponse;
}
