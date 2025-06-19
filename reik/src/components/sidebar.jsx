import { Button } from "@/components/ui/button";
import NumPad from "./numPad";
import { Input } from "@/components/ui/input"
import { useStore } from "@/store";
import {
  LuLock,
  LuLogOut,
  LuMenu,
  LuPrinter,
  LuSettings,
  LuClipboardList,
  LuCalendar,
  LuMonitor,
  LuInfo,
} from 'react-icons/lu'; // Replace with your actual icons
import { TbCashRegister } from "react-icons/tb";

import React from 'react';

const Sidebar = ({ IconButton }) => {
  const { setIsOpen } = useStore();

  return (
    <div className="flex flex-col gap-1.5 px-3 w-[20%] xl:w-64 bg-gray-100 border-l ">
      <SidebarButton Icon={LuLogOut} label="Quit" className="text-red-600 mt-8" />
      <SidebarButton Icon={LuLock} label="Lock (Ctrl+L)" />
      <Input className="bg-white" onClick={setIsOpen} readOnly />
      <NumPad />
      <SidebarButton Icon={LuMenu} label="Menu" />
      <SidebarButton Icon={LuPrinter} label="Label" />
      <SidebarButton Icon={LuSettings} label="Setup" />
      <SidebarButton Icon={LuClipboardList} label="Reports" />
      <SidebarButton Icon={LuCalendar} label="End of Day" />
      <SidebarButton Icon={LuMonitor} label="Station" />
      <SidebarButton Icon={LuInfo} label="What's New?" />
      <IconButton Icon={TbCashRegister} label="Cash Drawer" className="bg-yellow-500 text-white border-0 hover:bg-yellow-600 hover:text-white" />
    </div>
  );
};

const SidebarButton = ({ Icon, label, className = '' }) => (
  <Button
    variant="link"
    className={`flex justify-start ${className}`}>
    <Icon className="w-6 h-6" />
    <span className="text-base">{label}</span>
  </Button>
);

export default Sidebar;
