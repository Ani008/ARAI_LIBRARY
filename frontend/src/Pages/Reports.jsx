import React from "react";
import { useState } from "react";
import { downloadReport } from "../services/reportService";
import {
  FileText,
  BookOpen,
  Layers,
  Users,
  Download,
  Calendar,
  Tag,
  History,
  AlertCircle,
  MapPin,
} from "lucide-react";

const ReportAction = ({ label, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="group flex items-center justify-between w-full p-3 text-left transition-all duration-200 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
        <Icon size={16} className="text-slate-500" />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    <Download
      size={14}
      className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity"
    />
  </button>
);

const SectionCard = ({
  title,
  description,
  icon: Icon,
  children,
  accentColor,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
    <div className={`h-1.5 w-full ${accentColor}`} />
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-lg bg-opacity-10 ${accentColor.replace("bg-", "bg-opacity-10 text-")}`}
        >
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-1 mt-4 flex-1">{children}</div>
    </div>
  </div>
);

const Reports = () => {
  const [openArrivals, setOpenArrivals] = useState(null);
  // 'category' | 'type' | null

  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">
            Management Reports
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Generate and download analytical data in Excel format.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-slate-200">
          {/* Standards */}
          <SectionCard
            title="Standards"
            description="Technical guidelines & norms"
            icon={FileText}
            accentColor="bg-amber-500"
          >
            <ReportAction
              icon={Layers}
              label="Department-wise"
              onClick={() =>
                downloadReport(
                  "/api/reports/standards/department-wise",
                  "Standards_Dept",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={Tag}
              label="Category-wise"
              onClick={() =>
                downloadReport(
                  "/api/reports/standards/category-wise",
                  "Standards_Category",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={History}
              label="Amendments History"
              onClick={() =>
                downloadReport(
                  "/api/reports/standards/amendments",
                  "Standards_Amendments",
                  "xlsx"
                )
              }
            />
          </SectionCard>

          {/* Periodicals */}
          <SectionCard
            title="Periodicals"
            description="Journal & Magazine tracking"
            icon={BookOpen}
            accentColor="bg-blue-500"
          >
            <ReportAction
              icon={Calendar}
              label="Year-wise Analysis"
              onClick={() =>
                downloadReport(
                  "/api/reports/periodicals/year-wise",
                  "Periodicals_Year",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={History}
              label="Frequency Report"
              onClick={() =>
                downloadReport(
                  "/api/reports/periodicals/frequency-wise",
                  "Periodicals_Freq",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={AlertCircle}
              label="Missing Issues"
              onClick={() =>
                downloadReport(
                  "/api/reports/periodicals/missing-issues",
                  "Missing_Issues",
                  "xlsx"
                )
              }
            />
          </SectionCard>

          {/* Abstracts */}
          <SectionCard
            title="ARAI Abstracts"
            description="Research & Literature"
            icon={Layers}
            accentColor="bg-rose-500"
          >
            <ReportAction
              icon={Layers}
              label="Department Summary"
              onClick={() =>
                downloadReport(
                  "/api/reports/abstracts/department-wise",
                  "Abstracts_Dept",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={Calendar}
              label="Yearly Archives"
              onClick={() =>
                downloadReport(
                  "/api/reports/abstracts/year-wise",
                  "Abstracts_Year",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={Tag}
              label="Keyword Analysis"
              onClick={() =>
                downloadReport(
                  "/api/reports/abstracts/keyword-analysis",
                  "Keyword_Analysis",
                  "xlsx"
                )
              }
            />
          </SectionCard>

          {/* KC Membership */}
          <SectionCard
            title="KC Membership"
            description="Member lifecycle & Billing"
            icon={Users}
            accentColor="bg-green-500"
          >
            <ReportAction
              icon={Users}
              label="Complete Directory"
              onClick={() =>
                downloadReport(
                  "/api/reports/kcmembers/complete",
                  "Member_Directory",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={AlertCircle}
              label="Overdue Payments"
              onClick={() =>
                downloadReport(
                  "/api/reports/kcmembers/overdue",
                  "Overdue_Report",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={Calendar}
              label="Upcoming Renewals"
              onClick={() =>
                downloadReport(
                  "/api/reports/kcmembers/upcoming-renewals",
                  "Renewals",
                  "xlsx"
                )
              }
            />
            <ReportAction
              icon={MapPin}
              label="Address Labels"
              onClick={() =>
                downloadReport(
                  "/api/reports/kcmembers/address-labels",
                  "Address_Labels",
                  "xlsx"
                )
              }
            />
          </SectionCard>

          {/* New Arrivals & News */}
          <SectionCard
            title="New Arrivals & News"
            description="Library updates & announcements"
            icon={FileText}
            accentColor="bg-purple-500"
          >
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() =>
                  setOpenArrivals(
                    openArrivals === "category" ? null : "category",
                  )
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-slate-50"
              >
                Category-wise
              </button>

              <button
                onClick={() =>
                  setOpenArrivals(openArrivals === "type" ? null : "type")
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-slate-50"
              >
                Type-wise
              </button>
            </div>

            {/* CATEGORY WISE */}
            {openArrivals === "category" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "Technical",
                  "Academic",
                  "Research",
                  "General",
                  "Sports",
                  "Entertainment",
                  "Business",
                  "Technology",
                ].map((cat) => (
                  <ReportAction
                    key={cat}
                    label={cat}
                    icon={Tag}
                    onClick={() =>
                      downloadReport(
                        `/api/reports/arrivals-news/category-wise?category=${encodeURIComponent(cat)}`,
                        `Arrivals_Category_${cat}`,
                        "pdf"
                      )
                    }
                  />
                ))}
              </div>
            )}

            {/* TYPE WISE */}
            {openArrivals === "type" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "New Arrival",
                  "Daily News",
                  "Newspaper",
                  "Announcement",
                  "Events",
                ].map((type) => (
                  <ReportAction
                    key={type}
                    label={type}
                    icon={FileText}
                    onClick={() =>
                      downloadReport(
                        `/api/reports/arrivals-news/type-wise?type=${encodeURIComponent(type)}`,
                        `Arrivals_Type_${type}`,
                        "pdf"
                      )
                    }
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Reports;
