---
phase: 2
title: "Kiến trúc Hệ thống Clean Architecture & Mô hình Thực thể"
status: pending
priority: P1
effort: "0.5d"
dependencies: ["phase-01-start"]
---

# Phase 2: Kiến trúc Hệ thống Clean Architecture & Mô hình Thực thể

## Overview
Thiết kế kiến trúc tổng thể ứng dụng theo mô hình Clean Architecture (hoặc 3-Tier Layered Architecture) và thiết kế mô hình thực thể dữ liệu (Domain Entities), đảm bảo phân tách rõ ràng trách nhiệm giữa Domain, Application, Infrastructure và Presentation.

## Requirements
- Phân chia tầng kiến trúc:
  - `Domain Layer`: Chứa các Entities, Value Objects, Domain Interfaces (độc lập hoàn toàn với framework và thư viện ngoài).
  - `Application Layer`: Chứa Use Cases, DTOs, Service Interfaces, điều phối luồng nghiệp vụ.
  - `Infrastructure Layer`: Chứa các bộ Adapter (cổng thanh toán bên thứ ba, database mock/in-memory, dịch vụ gửi mail/SMS).
  - `Presentation / CLI Layer`: Giao diện tương tác điều khiển, demo các kịch bản.
- Thiết kế mô hình dữ liệu thực thể (ERD/Domain Model): `Customer`, `Product`, `OrderItem`, `Order`, `PaymentTransaction`, `ShippingInfo`, `DiscountPolicy`.

## Architecture
- Luồng phụ thuộc (Dependency Rule): Các tầng ngoài phụ thuộc vào tầng trong; tầng trong không biết gì về tầng ngoài; tuân thủ nguyên lý Đảo ngược phụ thuộc (DIP).
- Sơ đồ kiến trúc tổng thể (Architectural Diagram) thể hiện vị trí của từng Design Pattern được nhúng vào các tầng.

## Related Code Files
- Create: `docs/architecture/clean-architecture.md`
- Create: `docs/architecture/domain-model.puml`
- Create: `src/domain/entities/...`
- Create: `src/domain/interfaces/...`

## Implementation Steps
1. Thiết kế sơ đồ kiến trúc hệ thống tổng thể và phân tầng trách nhiệm.
2. Thiết kế sơ đồ lớp thực thể Domain (Class Diagram cho Domain Entities).
3. Định nghĩa các thực thể cốt lõi (`Product`, `Customer`, `Order`, `Payment`, `Notification`).
4. Thiết lập khung cấu trúc thư mục dự án tuân thủ Clean Architecture.

## Success Criteria
- [x] Có sơ đồ kiến trúc phần mềm rõ ràng, phân tầng mạch lạc.
- [x] Có sơ đồ thực thể dữ liệu / Domain Model chi tiết.
- [x] Đạt trọn vẹn điểm mục "Kiến trúc hệ thống và mô hình thực thể dữ liệu" (1.5đ).

## Risk Assessment
- Rủi ro: Kiến trúc quá cồng kềnh với nhiều abstraction rỗng.
- Biện pháp khắc phục: Giữ cấu trúc Clean Architecture ở mức tối giản (Lean Clean Architecture), chỉ tạo các Interface thực sự cần thiết cho việc đảo ngược phụ thuộc và gắn Design Patterns.
