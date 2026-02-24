import React, { useState, useEffect, use } from "react";
import axios from "axios";
import {
  FileText,
  Newspaper,
  Library,
  Eye,
  Bell,
  Mail,
  ChevronDown,
} from "lucide-react";
import StatCard from "../Components/StatCard";
import banerimg from "../assets/banerimg.png";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [standardsCount, setStandardsCount] = useState(0);
  const [periodicalsCount, setPeriodicalsCount] = useState(0);
  const [abstractsCount, setAbstractsCount] = useState(0);
  const [KCMembersCount, setKCMembersCount] = useState(0);

  useEffect(() => {
    const fetchStandardsCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/standards`);
        if (response.data && response.data.success) {
          setStandardsCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching standards count:", error);
      }
    };

    const fetchPeriodicalsCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/periodicals`);
        if (response.data && response.data.success) {
          setPeriodicalsCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching periodicals count:", error);
      }
    };

    const fetchAbstractsCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/abstracts`);
        if (response.data && response.data.success) {
          setAbstractsCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching abstracts count:", error);
      }
    };

    const fetchKCMembersCount = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/kcmembers`);
        if (response.data && response.data.success) {
          setKCMembersCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching KC Members count:", error);
      }
    };

    fetchKCMembersCount();
    fetchAbstractsCount();
    fetchPeriodicalsCount();
    fetchStandardsCount();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-indigo-50 rounded-3xl px-12 py-15 flex justify-between items-center mb-10 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Hi, There
          </h1>
          <p className="text-sm text-gray-500">
            Ready to start your day with some updates?
          </p>
        </div>
        <img
          src={banerimg}
          alt="Illustration"
          className="absolute right-6 bottom-0 h-50 opacity-90"
        />
      </div>

      <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-xs mb-4">
        Overview
      </h3>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-7 mb-10 ">
        <StatCard
          label="Standards"
          value={standardsCount}
          subLabel="STANDARDS"
          color="bg-amber-400"
          icon={<FileText className="text-white w-6 h-6" />}
          onClick={() => navigate("/standards")}
        />
        <StatCard
          label="Periodicals"
          value={periodicalsCount}
          subLabel="PERIODICALS"
          color="bg-indigo-600"
          icon={<Newspaper className="text-white w-6 h-6" />}
          onClick={() => navigate("/periodicals")}
        />
        <StatCard
          label="Abstracts"
          value={abstractsCount}
          subLabel="ABSTRACT"
          color="bg-rose-500"
          icon={<Library className="text-white w-6 h-6" />}
          onClick={() => navigate("/abstracts")}
        />
        <StatCard
          label="Total Views"
          value={KCMembersCount}
          subLabel="TOTAL MEMBERS"
          color="bg-green-500"
          icon={<Eye className="text-green-100 w-6 h-6" />}
          onClick={() => navigate("/kcmembers")}
        />
      </div>
    </div>
  );
};

export default Dashboard;
