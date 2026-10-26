import React from 'react';
import SEO from '../../components/common/SEO';
import { Truck, Clock, MapPin, CheckCircle, Package } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-body text-gray-800">
      <SEO
        title="Shipping & Delivery Policy | FynDry"
        description="FynDry Shipping Policy: Delivery timelines, courier tracking, pan-India coverage, and free shipping thresholds."
        canonical="https://fyndry.com/shipping-policy"
      />

      <div className="border-b border-gray-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <Truck className="w-4 h-4" />
          <span>Fulfillment & Delivery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Fast, secure, and reliable food-safe courier transit across India.
        </p>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            1. Shipping Coverage
          </h2>
          <p>
            FynDry ships to over <strong>19,000+ PIN codes</strong> across India through premier logistics partners including Delhivery, BlueDart, DTDC, and Shiprocket. We ensure all remote and urban regions are covered.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            2. Processing & Dispatch Timelines
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Order Processing:</strong> Orders placed before 1:00 PM IST on business days (Monday to Saturday) are packed and dispatched on the same day.
            </li>
            <li>
              <strong>Standard Dispatch Time:</strong> Within <strong>24 to 36 hours</strong> of order payment confirmation.
            </li>
            <li>
              Orders placed on Sundays or National Public Holidays are dispatched on the next working business day.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            3. Estimated Transit Times
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Metro Cities</h4>
              <p className="text-xs text-gray-500">
                Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad.
              </p>
              <span className="inline-block mt-2 font-heading font-black text-primary text-sm">
                2 to 4 Business Days
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm mb-1">Rest of India & Tier 2/3</h4>
              <p className="text-xs text-gray-500">
                Regional districts, state capitals, and non-metro postal codes.
              </p>
              <span className="inline-block mt-2 font-heading font-black text-primary text-sm">
                3 to 6 Business Days
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            4. Shipping Charges & Free Delivery Threshold
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Free Shipping:</strong> On all domestic orders with a cart subtotal of <strong>₹499 or higher</strong>.
            </li>
            <li>
              <strong>Standard Shipping Fee:</strong> A nominal flat fulfillment fee of <strong>₹49</strong> is charged on orders below ₹499.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            5. Real-Time Tracking Updates
          </h2>
          <p>
            As soon as your package is scanned by the courier, you will receive an automated email and WhatsApp notification with the tracking waybill number and a live tracking URL. You can also monitor delivery progress from your FynDry <em>Account &gt; Orders</em> page.
          </p>
        </section>
      </div>
    </div>
  );
}
