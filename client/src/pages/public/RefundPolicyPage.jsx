import React from 'react';
import SEO from '../../components/common/SEO';
import { RotateCcw, ShieldCheck, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-body text-gray-800">
      <SEO
        title="Refund & Cancellation Policy | FynDry"
        description="FynDry Refund, Return, and Cancellation Policy for food orders, damaged packages, and payment reversals."
        canonical="https://fyndry.com/refund-policy"
      />

      <div className="border-b border-gray-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <RotateCcw className="w-4 h-4" />
          <span>Customer Assurance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Clear, transparent policies for food safety and order satisfaction.
        </p>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            1. Order Cancellation Policy
          </h2>
          <p>
            You may cancel your order free of charge at any time before it enters the <strong>&quot;Packed&quot;</strong> or <strong>&quot;Shipped&quot;</strong> stage:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Pre-dispatch Cancellation:</strong> If your order is in &quot;Placed&quot; or &quot;Confirmed&quot; status, you can cancel it directly from your Account Dashboard under <em>Order Details</em>, or by emailing <strong>support@fyndry.com</strong> within 2 hours of placing the order.
            </li>
            <li>
              <strong>Post-dispatch:</strong> Once an order has been handed over to our courier partner and a tracking waybill has been generated, it cannot be canceled mid-transit.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            2. Perishable Food Returns & Replacements
          </h2>
          <p>
            Because dehydrated fruits and vegetable powders are consumable food products, we cannot accept returns once the tamper-evident pouch seal is broken, in compliance with Food Safety and Standards Authority of India (FSSAI) hygiene regulations.
          </p>
          <p>
            However, we provide a <strong>100% Free Replacement or Full Refund</strong> in any of the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>The parcel arrived physically crushed or damaged during transit.</li>
            <li>The outer nitrogen moisture seal was breached or compromised upon arrival.</li>
            <li>An incorrect item or pack size was dispatched compared to your invoice.</li>
            <li>The product delivered has crossed its 12-month expiration date.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            3. How to Request a Replacement or Refund
          </h2>
          <p>
            Please notify us within <strong>48 hours</strong> of package delivery by emailing <strong>support@fyndry.com</strong> or WhatsApping <strong>+91 98765 43210</strong> with:
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-sm">
            <li>Your Order Number (e.g. FD-2026-XXXXXX).</li>
            <li>A clear photograph/video of the outer shipping box label and the damaged/incorrect food pouch.</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Our quality support team reviews and approves verified claims within 24 business hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            4. Refund Processing Timelines
          </h2>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 text-sm">
            <p>
              Once approved, refunds are credited back to the original source payment method through Razorpay:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-gray-600">
              <li><strong>UPI (Google Pay, PhonePe, Paytm):</strong> 1–2 business days.</li>
              <li><strong>Credit / Debit Cards:</strong> 4–7 business days (dependent on card issuer bank).</li>
              <li><strong>Net Banking:</strong> 2–5 business days.</li>
              <li><strong>Cash on Delivery (COD):</strong> Transferred via NEFT/IMPS bank transfer or UPI within 48 hours of collecting bank details.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
