import React from "react";
import { ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layouts";

const OFFER_URL = "https://forms.monday.com/forms/744fdd9e00a80674f1dd30a5467f8d28?r=use1";
const LISTING_URL = "https://wkf.ms/456PiPC";

export default function TransactionRequestsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-2xl md:text-3xl text-black font-manrope"
            style={{ fontWeight: 800 }}
          >
            Transaction Requests
          </h1>
          <p
            className="mt-1 text-sm text-[#595959] font-roboto"
            style={{ fontWeight: 400 }}
          >
            Open the relevant Monday.com form to submit your request.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white px-5 py-4 text-sm font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 800 }}
            >
              TRANSACTION REQUESTS — LISTING REQUEST
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={OFFER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white px-5 py-4 text-sm font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 800 }}
            >
              TRANSACTION REQUESTS — OFFER REQUEST
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
