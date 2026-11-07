# Inventory & Invoice Management

A standalone, library-first billing, inventory, expense, and appointment management application reverse-engineered for high-velocity studio operations.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Calculations & Validation**: Zod schema validation for line-item tax calculations, split payment validation, and discounts
- **Visual Analytics**: Recharts SVG responsive bar & donut financial charts
- **Receipt & Invoice Printing**: Dual-mode `react-to-print` (Standard A4 Tax Invoice & 80mm POS Thermal Receipt)
- **Data Persistence**: Offline-first reactive store with cloud database sync capability

## Key Workflows

1. **Billing Management**: Full invoice ledger with search, filtering, and payment status badges.
2. **Invoice Generation**: Customer auto-linking, vehicle metadata chips, customizable line items (services & consumables), staff assignment, and single or split payments.
3. **Product Inventory**: Real-time consumable stock control with minimum stock alert thresholds and rapid `+` / `-` stock adjustments.
4. **Expense Tracker**: Operational overhead management with category classifications and payment method splits.
5. **Appointment Scheduler**: Booking management with advance deposit tracking and one-click bill conversion.
6. **Financial Reports**: P&L metrics, revenue vs. expense comparisons, and expandable deposit audit breakdowns.

## Getting Started

```bash
# Install dependencies
npm.cmd install

# Start development server
npm.cmd run dev

# Production build
npm.cmd run build
```
