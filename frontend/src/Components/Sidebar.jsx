import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 1. Import Router hooks
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Library,
  FileSignature,
  Mail,
  Users,
  BarChart3,
  NotepadTextDashedIcon,
} from "lucide-react";
import logo from "../assets/logo.png";

const Sidebar = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const location = useLocation(); // 3. Get current URL path

  const menuGroups = [
    {
      title: "MAIN MODULES",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
        { name: "Standards", icon: FileText, path: "/standards" },
        { name: "Periodicals", icon: Newspaper, path: "/periodicals" },
        { name: "Automotive Abstracts", icon: Library, path: "/abstracts" },
      ],
    },
    {
      title: "ARAI AJMT",
      items: [
        { name: "AJMT Papers", icon: FileSignature, path: "/ajmtpapers" },
      ],
    },
    {
      title: "MEMBERSHIP",
      items: [{ name: "KC Members", icon: Users, path: "/kcmembers" }],
    },
    {
      title: "REPORTS",
      items: [{ name: "Reports", icon: BarChart3, path: "/reports" }],
    },
    {
      title: "NEWS & UPDATES",
      items: [
        {
          name: "New Arrivals & News",
          icon: NotepadTextDashedIcon,
          path: "/new-arrivals-news",
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-white shadow-sm shrink-0">
      <div className="flex h-16 items-center gap-3 px-6 border-b bg-white">
        <img
          src={logo}
          alt="ARAI Library Logo"
          className="h-9 w-auto object-contain"
        />
        
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="px-6 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              {group.title}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => {
                // 4. Check if current path matches item path
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)} // 5. Use navigate on click
                    className={`w-full flex items-center px-6 py-2.5 text-sm font-medium transition-all relative group
                      ${
                        isActive
                          ? "text-indigo-700 bg-[#EBE9FE]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    )}

                    <item.icon
                      className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
