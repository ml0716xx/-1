/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Bell, ChevronDown, RefreshCw, User, Check, AlertCircle, Info, Calendar } from "lucide-react";
import { Site, SystemNotification } from "../types";

interface TopbarProps {
  sites: Site[];
  selectedSite: Site;
  setSelectedSite: (site: Site) => void;
  notifications: SystemNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  setCurrentTab: (tab: string) => void;
}

export default function Topbar({
  sites,
  selectedSite,
  setSelectedSite,
  notifications,
  setNotifications,
  setCurrentTab
}: TopbarProps) {
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (n: SystemNotification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    );
    if (n.linkToTab) {
      setCurrentTab(n.linkToTab);
    }
    setShowNotificationDropdown(false);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0 font-sans">
      {/* Breadcrumb / Screen Title */}
      <div className="flex items-center space-x-3">
        <span className="text-gray-400 text-xs">智能微网系统 / 统一运行调度中心</span>
        <span className="text-gray-300">/</span>
        <div className="flex items-center space-x-1 bg-teal-50 px-2 py-1 rounded text-teal-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span>系统在线</span>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center space-x-5 text-xs text-gray-600">
        {/* System Date Calendar */}
        <div className="flex items-center space-x-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-100 font-mono">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>2026-06-08 10:42:19 UTC (周一)</span>
        </div>

        {/* Site Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSiteDropdown(!showSiteDropdown)}
            onBlur={() => setTimeout(() => setShowSiteDropdown(false), 200)}
            className="flex items-center space-x-2 bg-gray-100/80 hover:bg-gray-100 px-3  py-1.5 rounded-lg border border-gray-200 cursor-pointer text-gray-800 transition"
          >
            <span className="font-medium text-xs">{selectedSite.name}</span>
            {selectedSite.meterNo ? (
              <span className="bg-teal-100 text-teal-800 text-[10px] px-1 py-0.2 rounded font-mono">
                户号: {selectedSite.meterNo}
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-[10px] px-1 py-0.2 rounded">
                无户号(未激活VPP)
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showSiteDropdown && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1 transition-all duration-150">
              <div className="px-3 py-1.5 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                选择操作站点
              </div>
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site);
                    setShowSiteDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-gray-50 transition ${
                    selectedSite.id === site.id ? "bg-teal-50 text-teal-900 border-l-2 border-teal-500" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>{site.name}</span>
                    <span className={`text-[10px] ${site.status === "运行中" ? "text-teal-600" : "text-gray-400"}`}>
                      ● {site.status}
                    </span>
                  </div>
                  <div className="flex text-[10px] text-gray-500 justify-between mt-1">
                    <span>配置户号: {site.meterNo || "未配置"}</span>
                    <span>规模: {site.capacity}kW</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer relative transition"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl z-50 overflow-hidden text-gray-800">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-gray-700">通知与消息提醒</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-teal-600 hover:text-teal-700 text-[10px] font-medium"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    暂无任何通知
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-left hover:bg-gray-50 cursor-pointer transition flex space-x-2.5 ${
                        !n.isRead ? "bg-teal-50/40" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === "invitation_new" && (
                          <Bell className="w-4 h-4 text-orange-500" />
                        )}
                        {n.type === "strategy_created" && (
                          <Check className="w-4 h-4 text-teal-600" />
                        )}
                        {n.type === "exec_exception" && (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                        {n.type === "strategy_exec_start" && (
                          <Info className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold text-xs ${!n.isRead ? "text-teal-900" : "text-gray-700"}`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono">{n.timestamp.split(" ")[1]}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>
                        {n.linkToTab && (
                          <span className="text-[10px] text-teal-600 font-medium inline-block underline mt-1">
                            点击去确认并编排 →
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 py-1">
          <div className="w-7 h-7 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs">
            易立
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-xs leading-tight text-gray-800">薛易立</span>
            <span className="text-[10px] text-gray-400">系统调度员</span>
          </div>
        </div>
      </div>
    </header>
  );
}
