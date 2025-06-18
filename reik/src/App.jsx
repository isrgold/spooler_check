import React from "react";
import { Button } from "@/components/ui/button";
import { RiScales2Line } from "react-icons/ri";
import { FaRegAddressBook } from "react-icons/fa";
import { TfiUser } from "react-icons/tfi";
import Sidebar from "@/components/sidebar";
import {
  LuCalendarFold,
  LuClipboardList,
  LuCircleCheckBig,
  LuClock,
  LuBike,
} from "react-icons/lu";

const colorClasses = {
  "yellow-500": "border-yellow-500 text-yellow-500 hover:text-yellow-400 hover:border-yellow-400",
  "red-600": "border-red-600 text-red-600 hover:text-red-500 hover:border-red-500",
  "blue-600": "border-blue-600 text-blue-600 hover:text-blue-500 hover:border-blue-500",
  "green-600": "border-green-600 text-green-600 hover:text-green-500 hover:border-green-500",
  "purple-600": "border-purple-600 text-purple-600 hover:text-purple-500 hover:border-purple-500",
};


const IconButton = ({ Icon, label, color, size = "w-36 h-36" }) => {
  const colorClass = colorClasses[color];

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="outline"
        className={`group ${size} rounded-full border-3 ${colorClass} flex flex-col items-center justify-center`}>
        <Icon className="size-16 transition-all duration-200 group-hover:w-[4.5rem] group-hover:h-[4.5rem]" />
      </Button>
      <span className="mt-1 text-base font-medium text-center text-red">{label}</span>
    </div>
  );
};

export default function POSDashboard() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col w-full px-10 xl:px-[15%]">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-bold">
            G-POS by IKON Innovations - [FINS Fish Market - 9.65]
          </div>
          <div className="flex space-x-4">

            <Button variant="ghost">
            </Button>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <IconButton Icon={TfiUser} label="Walk-Ins" color="yellow-500" size="w-42 h-42" />
          <IconButton Icon={FaRegAddressBook} label="Accounts" color="yellow-500" size="w-42 h-42" />
          <IconButton Icon={RiScales2Line} label="Scale" color="yellow-500" size="w-42 h-42" />
        </div>

        <div className="flex justify-center items-center gap-4 mb-6">
          <Button variant="outline" className="flex items-center gap-2">
            <LuBike className="w-5 h-5" /> Depart Runner
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <LuBike className="w-5 h-5" /> Collect Runner
          </Button>
          <div className="text-sm text-gray-600 font-bold">0 (0)</div>
        </div>

        <div className="flex justify-between mb-6">
          <IconButton Icon={LuClipboardList} label="Open Orders" color="red-600" />
          <IconButton Icon={LuCircleCheckBig} label="Ready Orders" color="green-600" />
          <IconButton Icon={LuClock} label="Recent Orders" color="blue-600" />
          <IconButton Icon={LuCalendarFold} label="Steady Orders" color="purple-600" />
        </div>

        <div className="flex justify-end">
          <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
            Cash Drawer
          </Button>
        </div>
      </div>

      <Sidebar />
    </div>
  );
}
