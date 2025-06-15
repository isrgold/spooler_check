import React from "react";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  ClipboardList,
  CheckCircle,
  Clock,
  Activity,
  Users,
  BookUser,
  Bike,
  Monitor,
  Lock,
  LogOut,
  FileText,
  Scale,
} from "lucide-react";

const IconButton = ({ Icon, label, color = "text-gray-800" }) => (
  <div className="flex flex-col items-center">
    <Button 
    variant="outline" 
    className={`w-14 h-14 rounded-full ${color}`}>
      <Icon size={22} />
    </Button>
    <span className="mt-2 text-sm font-medium text-center">{label}</span>
  </div>
);

export default function POSDashboard() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-bold">
            G-POS by IKON Innovations - [FINS Fish Market - 9.65]
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" className="text-red-600">
              Quit
            </Button>
            <Button variant="ghost">
              <Lock className="mr-2" size={16} /> Lock (Ctrl+L)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-8">
          <IconButton Icon={CircleUser} label="Walk-Ins" />
          <IconButton Icon={BookUser} label="Accounts" />
          <IconButton Icon={Scale} label="Scale" />
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Bike className="w-5 h-5" /> Depart Runner
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Bike className="w-5 h-5" /> Collect Runner
          </Button>
          <div className="text-sm text-gray-600 font-bold">0 (0)</div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-6">
          <IconButton Icon={ClipboardList} label="Open Orders" color="text-red-600" />
          <IconButton Icon={CheckCircle} label="Ready Orders" color="text-green-600" />
          <IconButton Icon={Clock} label="Recent Orders" color="text-blue-600" />
          <IconButton Icon={Activity} label="Steady Orders" color="text-purple-600" />
        </div>

        <div className="flex justify-end">
          <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
            Cash Drawer
          </Button>
        </div>
      </div>

      <div className="w-64 bg-gray-100 border-l p-4 flex flex-col space-y-4">
        <Button variant="ghost">Menu</Button>
        <Button variant="ghost">Label</Button>
        <Button variant="ghost">Setup</Button>
        <Button variant="ghost">Reports</Button>
        <Button variant="ghost">End of Day</Button>
        <Button variant="ghost">Station</Button>
        <Button variant="ghost">What's New?</Button>
      </div>
    </div>
  );
}
