/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  SquareTerminal, 
  Cpu, 
  AlertTriangle, 
  BarChart3, 
  FileSpreadsheet, 
  Workflow, 
  Settings2, 
  Activity, 
  ChevronRight, 
  Info,
  Calendar,
  Layers,
  Battery,
  Calculator,
  User,
  LayoutDashboard
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  vppPendingCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, vppPendingCount }: SidebarProps) {
  // Navigation menus
  const menuGroups = [
    {
      title: "微网总览",
      isExpandable: true,
      icon: LayoutDashboard,
      id: "overview",
      subItems: []
    },
    {
      title: "盈利方 AI",
      isExpandable: true,
      icon: Cpu,
      id: "profit_ai",
      subItems: []
    },
    {
      title: "监控中心",
      isExpandable: true,
      icon: SquareTerminal,
      id: "monitor_center",
      subItems: []
    },
    {
      title: "报警管理",
      isExpandable: true,
      icon: AlertTriangle,
      id: "alarm_mgr",
      subItems: []
    },
    {
      title: "统计报表",
      isExpandable: true,
      icon: BarChart3,
      id: "stats_report",
      subItems: []
    },
    {
      title: "智能报告",
      isExpandable: true,
      icon: FileSpreadsheet,
      id: "smart_report",
      subItems: []
    },
    {
      title: "策略管理",
      isExpandable: true,
      icon: Workflow,
      id: "strategy_mgr",
      isOpenDefault: true,
      subItems: [
        { name: "策略运行", id: "strategy-run", icon: Calendar },
        { name: "轻智能", id: "strategy-smart", icon: Settings2 }
      ]
    },
    {
      title: "微网管理",
      isExpandable: true,
      icon: Settings2,
      id: "microgrid_mgr",
      isOpenDefault: true,
      subItems: [
        { name: "站点管理", id: "sites", icon: Layers },
        { name: "设备管理", id: "devices", icon: Battery },
        { name: "拓扑管理", id: "topology", icon: Workflow },
        { name: "电价配置", id: "tariffs", icon: Calculator },
        { name: "指标配置", id: "indicators", icon: BarChart3 },
        { name: "需求响应", id: "demand-response", icon: Activity, showBadge: true },
        { name: "排班管理", id: "schedules", icon: Calendar }
      ]
    },
    {
      title: "系统日志",
      isExpandable: true,
      icon: Info,
      id: "sys_logs",
      subItems: []
    }
  ];

  return (
    <aside className="w-64 bg-[#0a1120] text-gray-300 flex flex-col h-screen border-r border-[#1a2538] select-none shrink-0" id="smart-sidebar">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1a2538] flex items-center space-x-2 bg-[#0d1627]">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-sm">
          TP
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-white leading-tight">TrinaPower 天合富家</h1>
          <p className="text-[10px] text-teal-400 font-medium">智能微网控制系统 v1.5</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 font-sans text-xs scrollbar-thin">
        <p className="text-[10px] text-gray-500 font-semibold px-2 uppercase tracking-wider">主导航</p>

        <div className="space-y-1">
          {menuGroups.map((group) => {
            const hasSubItems = group.subItems && group.subItems.length > 0;
            const isGroupActive = group.subItems.some((sub) => sub.id === currentTab) || group.id === currentTab;

            return (
              <div key={group.title} className="space-y-0.5">
                <div 
                  onClick={() => {
                    if (!hasSubItems) {
                      setCurrentTab(group.id);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isGroupActive && !hasSubItems 
                      ? "bg-teal-600/20 text-teal-400 font-medium border-l-2 border-teal-500" 
                      : "hover:bg-gray-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <group.icon className={`w-4 h-4 ${isGroupActive ? "text-teal-400" : "text-gray-400"}`} />
                    <span className="text-xs">{group.title}</span>
                  </div>
                  {hasSubItems && (
                    <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isGroupActive ? "rotate-90 text-teal-400" : ""}`} />
                  )}
                </div>

                {hasSubItems && (
                  <div className="pl-6 pt-0.5 pb-1 space-y-0.5 border-l border-gray-800/60 ml-5">
                    {group.subItems.map((sub) => {
                      const isSubActive = currentTab === sub.id;
                      const SubIcon = sub.icon;

                      return (
                        <div
                          key={sub.name}
                          onClick={() => setCurrentTab(sub.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs relative ${
                            isSubActive 
                              ? "bg-teal-600/30 text-teal-300 font-medium" 
                              : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? "text-teal-400" : "text-gray-500"}`} />
                            <span>{sub.name}</span>
                          </div>

                          {sub.showBadge && vppPendingCount > 0 && (
                            <span className="absolute right-2 top-2 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full scale-90 font-bold animate-pulse">
                              {vppPendingCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1a2538] bg-[#070c17] text-[10px] text-gray-500 space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span>系统核心状态</span>
          <span className="text-teal-400 animate-pulse font-bold">● 良好</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>EMS 通信组网</span>
          <span className="text-gray-400">TRINAPOWER-G2</span>
        </div>
        <div className="text-[9px] text-center text-gray-600 font-sans mt-1 border-t border-gray-800/40 pt-1.5">
          Copyright 2017-2026 Trina Power
        </div>
      </div>
    </aside>
  );
}
