import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { Customer, CustomerTier } from '../../domain/entities/customer';
import { Product } from '../../domain/entities/product';
import { OrderBuilder } from '../../domain/patterns/creational/builder/order.builder';
import { Order } from '../../domain/patterns/creational/builder/order.entity';
import { OrderEventPublisher } from '../../domain/patterns/behavioral/observer/order-event.publisher';
import { InventoryUpdateObserver } from '../../domain/patterns/behavioral/observer/concrete-order.observers';
import {
  EmailNotificationObserver,
  SmsNotificationObserver
} from '../../infrastructure/observers/notification.observers';
import {
  IOrderObserver,
  OrderEventPayload,
  ObserverNotificationResult
} from '../../domain/patterns/behavioral/observer/order-observer.interface';
import { OrderCheckoutService, CheckoutResult, CancellationResult } from '../../application/services/order-checkout.service';
import {
  VipMemberDiscountStrategy,
  HolidayTieredDiscountStrategy,
  RegularCustomerDiscountStrategy
} from '../../domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { IDiscountStrategy } from '../../domain/patterns/behavioral/strategy/discount-strategy.interface';
import { BaseOrderPricing } from '../../domain/patterns/structural/decorator/base-order.pricing';
import { GiftWrapDecorator, ShippingInsuranceDecorator } from '../../domain/patterns/structural/decorator/concrete-decorators';
import { IOrderPricing } from '../../domain/patterns/structural/decorator/order-pricing.interface';
import { VNPayPaymentFactory, MoMoPaymentFactory } from '../../domain/patterns/structural/adapter/adapter-factories';
import { ExternalVNPaySdk, ExternalMoMoSdk } from '../../infrastructure/gateways/third-party-payment-sdks';
import { BankTransferPaymentFactory } from '../../domain/patterns/creational/factory/bank-transfer.factory';
import { CODPaymentFactory } from '../../domain/patterns/creational/factory/cod-payment.factory';
import { PaymentProcessorFactory } from '../../domain/patterns/creational/factory/payment-processor.factory';

// Observer mô phỏng sự cố mạng để kiểm chứng tính chịu lỗi (Fault-Tolerance)
class FaultSimulationObserver implements IOrderObserver {
  public readonly observerName = 'Máy chủ Phân tích Tiếp thị (Marketing Analytics)';
  public isFailing = false;

  public update(payload: OrderEventPayload): void {
    if (this.isFailing) {
      throw new Error('Timeout kết nối dịch vụ ngoài (504 Gateway Timeout)');
    }
  }
}

export class WebPresentationServer {
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orderStore: Map<string, Order> = new Map();
  private checkoutHistory: any[] = [];

  private publisher: OrderEventPublisher;
  private inventoryObserver: InventoryUpdateObserver;
  private emailObserver: EmailNotificationObserver;
  private smsObserver: SmsNotificationObserver;
  private faultObserver: FaultSimulationObserver;
  private checkoutService: OrderCheckoutService;

  private vnpaySdk: ExternalVNPaySdk;
  private momoSdk: ExternalMoMoSdk;

  constructor() {
    this.vnpaySdk = new ExternalVNPaySdk();
    this.momoSdk = new ExternalMoMoSdk();

    this.publisher = new OrderEventPublisher();
    this.inventoryObserver = new InventoryUpdateObserver();
    this.emailObserver = new EmailNotificationObserver();
    this.smsObserver = new SmsNotificationObserver();
    this.faultObserver = new FaultSimulationObserver();

    this.publisher.attach(this.inventoryObserver);
    this.publisher.attach(this.emailObserver);
    this.publisher.attach(this.smsObserver);
    this.publisher.attach(this.faultObserver);

    this.checkoutService = new OrderCheckoutService(this.publisher);

    this.initData();
  }

  private initData() {
    this.products.clear();
    const p1 = new Product('PROD-01', 'Laptop Dell XPS 15 OLED (i9/32GB/1TB)', 'DELL-XPS-15', 45000000, 5, 'Laptop');
    const p2 = new Product('PROD-02', 'Bàn phím cơ không dây Keychron Q1 Pro', 'KEYCHRON-Q1P', 3700000, 15, 'Bàn phím');
    const p3 = new Product('PROD-03', 'Chuột Logitech MX Master 3S Darkfield', 'LOGI-MXM3S', 2500000, 20, 'Chuột');
    const p4 = new Product('PROD-04', 'Sách GoF Design Patterns (Bản dịch chuẩn)', 'BOOK-GOF-VN', 350000, 30, 'Sách');

    this.products.set(p1.id, p1);
    this.products.set(p2.id, p2);
    this.products.set(p3.id, p3);
    this.products.set(p4.id, p4);

    this.customers.clear();
    const c1 = new Customer('CUST-01', 'Trần Hoàng Nam', 'nam.tran@techcorp.vn', '0908889999', CustomerTier.VIP);
    const c2 = new Customer('CUST-02', 'Lê Thị Mai', 'mai.le@gmail.com', '0912345678', CustomerTier.REGULAR);
    const c3 = new Customer('CUST-03', 'Nguyễn Văn Bình', 'binh.nguyen@outlook.com', '0987654321', CustomerTier.SILVER);
    const c4 = new Customer('CUST-04', 'Phạm Quốc Đạt', 'dat.pham@company.vn', '0933221100', CustomerTier.GOLD);

    this.customers.set(c1.id, c1);
    this.customers.set(c2.id, c2);
    this.customers.set(c3.id, c3);
    this.customers.set(c4.id, c4);

    this.orderStore.clear();
    this.checkoutHistory = [];
  }

  private getStrategy(key: string): IDiscountStrategy {
    switch (key) {
      case 'VIP':
        return new VipMemberDiscountStrategy();
      case 'HOLIDAY':
        return new HolidayTieredDiscountStrategy();
      case 'REGULAR':
      default:
        return new RegularCustomerDiscountStrategy();
    }
  }

  private getPaymentFactory(key: string): PaymentProcessorFactory {
    switch (key) {
      case 'VNPAY':
        return new VNPayPaymentFactory(this.vnpaySdk);
      case 'MOMO':
        return new MoMoPaymentFactory(this.momoSdk);
      case 'BANK':
        return new BankTransferPaymentFactory();
      case 'COD':
      default:
        return new CODPaymentFactory();
    }
  }

  private parseJsonBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(new Error('Dữ liệu JSON không hợp lệ'));
        }
      });
      req.on('error', err => reject(err));
    });
  }

  private sendJson(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
  }

  public handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. API GET /api/state
    if (req.method === 'GET' && pathname === '/api/state') {
      const productList = Array.from(this.products.values()).map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stockQuantity,
        category: p.category
      }));

      const customerList = Array.from(this.customers.values()).map(c => ({
        id: c.id,
        fullName: c.name,
        email: c.email,
        phoneNumber: c.phone,
        tier: c.tier
      }));

      return this.sendJson(res, 200, {
        success: true,
        products: productList,
        customers: customerList,
        strategies: [
          { key: 'REGULAR', name: 'Khách thông thường (0%)', badge: 'Tiêu chuẩn', desc: 'Không áp dụng chiết khấu' },
          { key: 'VIP', name: 'Hội viên VIP (Giảm 15%)', badge: 'VIP 15%', desc: 'Chiết khấu 15% trên tổng hóa đơn' },
          { key: 'HOLIDAY', name: 'Khuyến mãi bậc thang (Flash Sale)', badge: 'Tiered Sale', desc: 'Giảm 500k cho đơn ≥5tr, 200k cho đơn ≥2tr, 50k cho đơn <2tr' }
        ],
        paymentMethods: [
          { key: 'VNPAY', name: 'Cổng VNPay (Thẻ ATM/QR Pay)', type: 'Adapter Pattern', provider: 'ExternalVNPaySdk' },
          { key: 'MOMO', name: 'Ví điện tử MoMo', type: 'Adapter Pattern', provider: 'ExternalMoMoSdk' },
          { key: 'BANK', name: 'Chuyển khoản Ngân hàng (Vietcombank)', type: 'Factory Method', provider: 'BankTransferProcessor' },
          { key: 'COD', name: 'Thanh toán tiền mặt khi nhận hàng (COD)', type: 'Factory Method', provider: 'CODPaymentProcessor' }
        ],
        observers: [
          { name: this.inventoryObserver.observerName, status: 'Hoạt động', type: 'Domain Core' },
          { name: this.emailObserver.observerName, status: 'Hoạt động', type: 'Infrastructure Service' },
          { name: this.smsObserver.observerName, status: 'Hoạt động', type: 'Infrastructure Gateway' },
          {
            name: this.faultObserver.observerName,
            status: this.faultObserver.isFailing ? 'Đang mô phỏng LỖI (504 Timeout)' : 'Hoạt động bình thường',
            isFailing: this.faultObserver.isFailing,
            type: 'Fault Simulation'
          }
        ],
        recentOrders: this.checkoutHistory,
        faultSimulationActive: this.faultObserver.isFailing
      });
    }

    // 2. API POST /api/preview (Tính toán giá với Decorator + Strategy mà không lưu đơn)
    if (req.method === 'POST' && pathname === '/api/preview') {
      this.parseJsonBody(req)
        .then(body => {
          const { items, customerId, withGiftWrap, withInsurance, strategyKey } = body;

          const customer = this.customers.get(customerId) || Array.from(this.customers.values())[0];
          const builder = new OrderBuilder(`ORD-PREVIEW-${Date.now().toString().slice(-4)}`);
          builder.setCustomer(customer);

          for (const it of items || []) {
            const product = this.products.get(it.productId);
            if (product && it.quantity > 0) {
              builder.addItem(product, it.quantity);
            }
          }

          builder.setShippingAddress({
            recipientName: customer.name,
            phoneNumber: customer.phone,
            street: '123 Đường Điện Biên Phủ, Phường 25',
            city: 'TP. Hồ Chí Minh'
          });

          builder.enableGiftWrap(!!withGiftWrap);
          builder.enableInsurance(!!withInsurance);

          const tempOrder = builder.build();

          // Decorator
          let pricing: IOrderPricing = new BaseOrderPricing(tempOrder);
          if (tempOrder.withGiftWrap) pricing = new GiftWrapDecorator(pricing);
          if (tempOrder.withInsurance) pricing = new ShippingInsuranceDecorator(pricing);

          const subtotalWithServices = pricing.calculateTotal();
          const pricingBreakdown = pricing.getBreakdown();

          // Strategy
          const strategy = this.getStrategy(strategyKey);
          const discountResult = strategy.calculateDiscount(tempOrder, subtotalWithServices);

          return this.sendJson(res, 200, {
            success: true,
            baseSubtotal: tempOrder.subtotal,
            pricingBreakdown,
            subtotalWithServices,
            discountDetails: {
              strategy: discountResult.strategyName,
              discountAmount: discountResult.discountAmount,
              description: discountResult.description
            },
            finalPayableAmount: discountResult.finalAmount
          });
        })
        .catch(err => {
          this.sendJson(res, 400, { success: false, error: err.message });
        });
      return;
    }

    // 3. API POST /api/checkout (Checkout thực tế kết hợp cả 6 Design Patterns)
    if (req.method === 'POST' && pathname === '/api/checkout') {
      this.parseJsonBody(req)
        .then(async body => {
          const { items, customerId, withGiftWrap, withInsurance, specialNotes, strategyKey, paymentMethod } = body;

          const customer = this.customers.get(customerId);
          if (!customer) {
            return this.sendJson(res, 400, { success: false, error: 'Không tìm thấy thông tin khách hàng.' });
          }

          if (!items || items.length === 0) {
            return this.sendJson(res, 400, { success: false, error: 'Giỏ hàng đang trống, vui lòng chọn ít nhất 1 sản phẩm.' });
          }

          // 1. Creational: Builder Pattern
          const orderId = `ORD-${Date.now().toString().slice(-6)}`;
          const builder = new OrderBuilder(orderId);
          builder.setCustomer(customer);

          for (const it of items) {
            const product = this.products.get(it.productId);
            if (!product) {
              return this.sendJson(res, 400, { success: false, error: `Sản phẩm [${it.productId}] không tồn tại.` });
            }
            builder.addItem(product, it.quantity);
          }

          builder.setShippingAddress({
            recipientName: customer.name,
            phoneNumber: customer.phone,
            street: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Bình Thạnh',
            city: 'TP. Hồ Chí Minh'
          });

          if (withGiftWrap) builder.enableGiftWrap(true);
          if (withInsurance) builder.enableInsurance(true);
          if (specialNotes) builder.setSpecialNotes(specialNotes);

          const order = builder.build();

          // 2. Behavioral: Strategy Pattern
          const strategy = this.getStrategy(strategyKey);

          // 3. Creational: Factory Method & Structural: Adapter Pattern
          const paymentFactory = this.getPaymentFactory(paymentMethod);

          // 4. Application Service Execution (kích hoạt Observer Pattern)
          const result = await this.checkoutService.checkout(order, strategy, paymentFactory);

          // Lưu đơn hàng vào memory store
          this.orderStore.set(order.orderId, order);

          const historyRecord = {
            orderId: order.orderId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            tier: customer.tier,
            itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
            subtotal: order.subtotal,
            finalAmount: result.finalPayableAmount,
            paymentMethod: result.paymentResult.paymentMethod,
            transactionId: result.paymentResult.transactionId,
            status: order.status,
            withGiftWrap: order.withGiftWrap,
            withInsurance: order.withInsurance,
            discountDescription: result.discountDetails.description,
            discountAmount: result.discountDetails.discountAmount,
            pricingBreakdown: result.pricingBreakdown,
            observerResults: result.observerResults,
            hasObserverFailure: result.hasObserverFailure,
            failedObservers: result.failedObservers,
            createdAt: new Date().toLocaleTimeString('vi-VN')
          };

          this.checkoutHistory.unshift(historyRecord);

          return this.sendJson(res, 200, {
            success: true,
            checkoutResult: historyRecord
          });
        })
        .catch(err => {
          this.sendJson(res, 400, { success: false, error: err.message });
        });
      return;
    }

    // 4. API POST /api/cancel (Huỷ đơn hàng, kích hoạt Observer hoàn kho)
    if (req.method === 'POST' && pathname === '/api/cancel') {
      this.parseJsonBody(req)
        .then(async body => {
          const { orderId, reason } = body;
          const order = this.orderStore.get(orderId);

          if (!order) {
            return this.sendJson(res, 404, { success: false, error: `Không tìm thấy đơn hàng [${orderId}].` });
          }

          const cancelResult = await this.checkoutService.cancelOrder(order, reason || 'Khách hàng yêu cầu hủy đơn');

          // Cập nhật lại lịch sử
          const existing = this.checkoutHistory.find(h => h.orderId === orderId);
          if (existing) {
            existing.status = order.status;
            existing.cancellationReason = order.cancellationReason;
          }

          return this.sendJson(res, 200, {
            success: true,
            message: `Đơn hàng [${orderId}] đã được huỷ thành công. Tồn kho đã được hoàn lại!`,
            cancelResult
          });
        })
        .catch(err => {
          this.sendJson(res, 400, { success: false, error: err.message });
        });
      return;
    }

    // 5. API POST /api/toggle-fault (Bật/tắt mô phỏng lỗi Observer để demo tính chịu lỗi)
    if (req.method === 'POST' && pathname === '/api/toggle-fault') {
      this.faultObserver.isFailing = !this.faultObserver.isFailing;
      return this.sendJson(res, 200, {
        success: true,
        isFailing: this.faultObserver.isFailing,
        message: this.faultObserver.isFailing
          ? 'Đã BẬT mô phỏng lỗi: Marketing Analytics Observer sẽ ném lỗi 504 khi có sự kiện.'
          : 'Đã TẮT mô phỏng lỗi: Mọi Observer hoạt động bình thường.'
      });
    }

    // 6. API POST /api/reset (Đặt lại tồn kho và lịch sử)
    if (req.method === 'POST' && pathname === '/api/reset') {
      this.initData();
      return this.sendJson(res, 200, {
        success: true,
        message: 'Hệ thống đã được thiết lập lại: Tồn kho khôi phục mặc định, xóa lịch sử thanh toán.'
      });
    }

    // 7. Static file serving (HTML UI)
    const publicDir = path.join(__dirname, 'public');
    let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(publicDir, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.png': 'image/png',
        '.svg': 'image/svg+xml'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }

  public start(port = 3333): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => this.handleRequest(req, res));
      server.listen(port, () => {
        console.log(`\n============================================================`);
        console.log(`  E-COMMERCE DESIGN PATTERNS LIVE PLATFORM (CLEAN ARCH)`);
        console.log(`  Giao diện Web: http://localhost:${port}`);
        console.log(`  Tầng Presentation: src/presentation/web/web-server.ts`);
        console.log(`  Trực quan hóa: 6 GoF Design Patterns & SOLID Principles`);
        console.log(`============================================================\n`);
        resolve(port);
      });
      server.on('error', err => reject(err));
    });
  }
}

// Chạy trực tiếp nếu file được thực thi bằng ts-node/node
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3333', 10);
  const server = new WebPresentationServer();
  server.start(port).catch(err => {
    console.error('Lỗi khởi động web server:', err);
    process.exit(1);
  });
}
