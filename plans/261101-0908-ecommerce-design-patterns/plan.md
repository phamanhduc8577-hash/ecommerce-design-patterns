---
title: "ecommerce-design-patterns"
description: "Kế hoạch thực hiện tiểu luận Mẫu thiết kế phần mềm: Hệ thống quản lý bán hàng và thương mại điện tử (E-commerce) áp dụng 6+ Design Patterns và 5 nguyên lý SOLID"
status: pending
priority: P1
effort: "5d"
tags: ["design-patterns", "solid", "clean-architecture", "ecommerce", "typescript", "node"]
created: 2026-11-01
---

# Kế hoạch Thực hiện Tiểu luận Mẫu Thiết kế Phần mềm
## Đề tài 1: Hệ thống Quản lý Bán hàng và Thương mại Điện tử (E-Commerce)

## Overview

Kế hoạch này vạch ra từng bước hoàn thành đề tài tiểu luận cuối kỳ học phần **Mẫu thiết kế cho phần mềm** (Lớp HP: 020100138402, HK1 2026-2027) đảm bảo đạt điểm tối đa (10/10) dựa trên rubric của khoa:
1. **Bố cục báo cáo (1.5đ)** & **Hình thức (1.5đ):** Đầy đủ các phần chuẩn format, trích dẫn APA/IEEE, sơ đồ chú thích rõ ràng.
2. **Tổng quan & Cơ sở lý thuyết + Kiến trúc (2.0đ):** Mô tả bài toán TMĐT, Use Case, kiến trúc Clean Architecture / 3 tầng, ERD, lý thuyết SOLID & Design Patterns.
3. **Phân tích 6 Design Patterns & SOLID (2.5đ):** 2 Creational + 2 Structural + 2 Behavioral; Class Diagram + Sequence Diagram; so sánh ưu/nhược với cách thiết kế thông thường; chứng minh tuân thủ 5 nguyên lý SOLID.
4. **Cài đặt mã nguồn, Thử nghiệm & Demo (1.5đ):** Mã nguồn TypeScript/Node.js chuẩn Clean Code, kịch bản test/demo CLI interactive sinh động, đánh giá hiệu năng & bảo trì.
5. **Vấn đáp & Hiểu biết (1.0đ):** Chuẩn bị câu hỏi - câu trả lời vấn đáp xoay quanh lý thuyết và thực tiễn từng pattern.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Xác định phạm vi nghiệp vụ TMĐT, Use Case và mô hình dữ liệu thực thể | P1 |
| 2 | Thiết lập kiến trúc phần mềm Clean Architecture & cấu trúc module chuẩn trong TypeScript | P1 |
| 3 | Hiện thực nhóm Creational Patterns (Factory Method + Builder) & chứng minh SOLID | P1 |
| 4 | Hiện thực nhóm Structural Patterns (Adapter + Decorator/Facade) & chứng minh SOLID | P1 |
| 5 | Hiện thực nhóm Behavioral Patterns (Strategy + Observer) & chứng minh SOLID | P1 |
| 6 | Xây dựng bộ kịch bản kiểm thử (Jest Unit Test + Interactive CLI demo có màu sắc) | P1 |
| 7 | Soạn thảo toàn bộ tài liệu báo cáo Markdown + xuất Word (.docx) chuẩn mẫu, vẽ sơ đồ UML và chuẩn bị cẩm nang vấn đáp | P1 |

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [Phase 1: Bối cảnh, Yêu cầu & Thiết kế Use Case](./phase-01-start.md) | Pending | 0.5d |
| 2 | [Phase 2: Kiến trúc Hệ thống Clean Architecture & Mô hình Thực thể](./phase-02-domain-and-architecture.md) | Pending | 0.5d |
| 3 | [Phase 3: Cài đặt Nhóm Creational Patterns (Factory Method & Builder)](./phase-03-creational-patterns.md) | Pending | 1.0d |
| 4 | [Phase 4: Cài đặt Nhóm Structural Patterns (Adapter & Decorator)](./phase-04-structural-patterns.md) | Pending | 1.0d |
| 5 | [Phase 5: Cài đặt Nhóm Behavioral Patterns (Strategy & Observer)](./phase-05-behavioral-patterns.md) | Pending | 1.0d |
| 6 | [Phase 6: Bộ Kịch bản Kiểm thử & Chương trình Demo Trực quan](./phase-06-testing-and-demo.md) | Pending | 0.5d |
| 7 | [Phase 7: Báo cáo Hoàn chỉnh, Sơ đồ UML & Bộ Câu hỏi Vấn đáp](./phase-07-report-and-defense-prep.md) | Pending | 0.5d |

## Success Criteria

- [ ] Hoàn thành mã nguồn TypeScript có thể chạy được trực tiếp qua `npm start` và `npm test`.
- [ ] Áp dụng đúng đắn, mượt mà tối thiểu 6 Design Patterns (2 Creational + 2 Structural + 2 Behavioral) trong bài toán bán hàng TMĐT.
- [ ] Chứng minh rõ ràng 5 nguyên lý SOLID (SRP, OCP, LSP, ISP, DIP) qua từng mẫu và cấu trúc code.
- [ ] Đủ sơ đồ Class Diagram và Sequence Diagram cho từng pattern (PlantUML / Mermaid).
- [ ] Có bộ Test Cases chạy minh chứng vai trò pattern khi so sánh với thiết kế không dùng pattern.
- [ ] Tài liệu báo cáo hoàn chỉnh định dạng Markdown và xuất ra Word (.docx) theo đúng mẫu điểm số quy định.

## Validation Log

### Session 1 - 2026-11-01
- **Tech Stack:** TypeScript + Node.js (tận dụng Static Typing cho Interface/Abstract class, dễ chạy ngay không phụ thuộc SDK nặng).
- **Demo Runner:** Interactive CLI / Console có màu sắc (chalk/cli-table), thể hiện trực quan luồng gọi từng pattern và giải thích tại chỗ.
- **Tài liệu nộp:** Markdown đầy đủ + file Word (.docx) chuẩn format học thuật (bìa, mục lục, bảng biểu, trích dẫn APA/IEEE) theo đúng rubric 1.5đ bố cục + 1.5đ hình thức.

### Whole-Plan Consistency Sweep
- Zero unresolved contradictions. Tất cả các phase đã khớp thống nhất về công nghệ TypeScript, giao diện CLI và tài liệu Word/Markdown.

<!-- slug: ecommerce-design-patterns -->
