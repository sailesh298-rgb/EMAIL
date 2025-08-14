import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

const SimpleEmailView = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Email View - Account {accountId}</h1>
          </div>
        </div>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Email Interface</h2>
          <p className="text-gray-600 mb-4">This is a simplified email view for testing purposes.</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmailView;