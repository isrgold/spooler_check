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

const colorClasses = {
  "gray-800": "border-gray-800 text-gray-800",
  "red-600": "border-red-600 text-red-600",
  "blue-400": "border-blue-400 text-blue-400",
  // Add more as needed
};


const IconButton = ({ Icon, label, color = "gray-800" }) => {
  const colorClass = colorClasses[color];
  return (<div className="flex flex-col items-center">
    <Button
      variant="outline"
      className={`w-36 h-36 rounded-full border-2 ${colorClass}`}>
      <Icon strokeWidth={1.7} className="size-14" />
    </Button>
    <span className="mt-2 text-sm font-medium text-center">{label}</span>
  </div>)

};

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
          <IconButton Icon={CircleUser} label="Walk-Ins" color="yellow-500" />
          <IconButton Icon={BookUser} label="Accounts" color="yellow-500" />
          <IconButton Icon={Scale} label="Scale" color="yellow-500" />
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
          <IconButton Icon={ClipboardList} label="Open Orders" color="red-600" />
          <IconButton Icon={CheckCircle} label="Ready Orders" color="green-600" />
          <IconButton Icon={Clock} label="Recent Orders" color="blue-600" />
          <IconButton Icon={Activity} label="Steady Orders" color="purple-600" />
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
