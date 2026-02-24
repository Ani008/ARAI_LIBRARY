import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MembershipCountModal = ({ onClose, data }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          Membership Count Summary
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <table className="w-full text-sm border border-slate-300 border-collapse">
        <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2 text-left border border-slate-300">
              Membership Type
            </th>
            <th className="px-4 py-2 text-right border border-slate-300">
              Total Count
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.type} className="hover:bg-slate-50">
              <td className="px-4 py-2 border border-slate-300">{row.type}</td>
              <td className="px-4 py-2 text-right font-semibold border border-slate-300">
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default MembershipCountModal;
