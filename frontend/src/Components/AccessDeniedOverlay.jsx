import React from "react";
import { Lock } from "lucide-react";

const AccessDeniedOverlay = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-[75vh]">

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border p-10 text-center">

        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock size={36} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">
          Access Denied
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          You don't have permission to access
        </p>

        <p className="mt-2 text-2xl font-semibold text-blue-600">
          {title}
        </p>

        <p className="mt-6 text-gray-500">
          Please contact your administrator if you believe
          this is a mistake.
        </p>

      </div>

    </div>
  );
};

export default AccessDeniedOverlay;