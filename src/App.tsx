/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./components/Overview";
import DemandResponse from "./components/DemandResponse";
import StrategySchedule from "./components/StrategySchedule";
import SiteManagement from "./components/SiteManagement";

import { 
  initialSites, 
  initialVppInvitations, 
  initialDrPlans, 
  initialStrategyGroups, 
  initialNotifications 
} from "./data";
import { Site, VppInvitation, DrPlan, StrategyGroup, SystemNotification, VppStatus } from "./types";
import { AlertCircle, Terminal, Cpu, Building2, BatteryCharging, Zap } from "lucide-react";

export default function App() {
  // Master states
  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem("vpp_sites");
    return saved ? JSON.parse(saved) : initialSites;
  });

  const [selectedSite, setSelectedSite] = useState<Site>(() => {
    const saved = localStorage.getItem("vpp_selected_site");
    return saved ? JSON.parse(saved) : initialSites[0];
  });

  const [vppInvitations, setVppInvitations] = useState<VppInvitation[]>(() => {
    const saved = localStorage.getItem("vpp_invitations");
    return saved ? JSON.parse(saved) : initialVppInvitations;
  });

  const [drPlans, setDrPlans] = useState<DrPlan[]>(() => {
    const saved = localStorage.getItem("vpp_dr_plans");
    return saved ? JSON.parse(saved) : initialDrPlans;
  });

  const [strategyGroups, setStrategyGroups] = useState<StrategyGroup[]>(() => {
    const saved = localStorage.getItem("vpp_strategy_groups");
    return saved ? JSON.parse(saved) : initialStrategyGroups;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem("vpp_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Current sub-route tab
  const [currentTab, setCurrentTab] = useState<string>("demand-response"); // Default to Demand Response as it's the primary PRD feature!

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("vpp_sites", JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem("vpp_selected_site", JSON.stringify(selectedSite));
  }, [selectedSite]);

  useEffect(() => {
    localStorage.setItem("vpp_invitations", JSON.stringify(vppInvitations));
  }, [vppInvitations]);

  useEffect(() => {
    localStorage.setItem("vpp_dr_plans", JSON.stringify(drPlans));
  }, [drPlans]);

  useEffect(() => {
    localStorage.setItem("vpp_strategy_groups", JSON.stringify(strategyGroups));
  }, [strategyGroups]);

  useEffect(() => {
    localStorage.setItem("vpp_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // VPP Pending count for sidebar badge
  const pendingVppCount = vppInvitations.filter((v) => v.status === VppStatus.PENDING_CONFIRM).length;

  return (
    <div className="flex bg-[#070c17] text-gray-800 h-screen w-screen overflow-hidden font-sans">
      
      {/* 200px (64) Left Navigation Drawer Column */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        vppPendingCount={pendingVppCount} 
      />

      {/* Main Core View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        
        {/* Top Header Navbar */}
        <Topbar 
          sites={sites}
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          notifications={notifications}
          setNotifications={setNotifications}
          setCurrentTab={setCurrentTab}
        />

        {/* Tab Switcher routing */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === "overview" && (
            <Overview 
              selectedSite={selectedSite}
              vppInvitations={vppInvitations}
              drPlans={drPlans}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === "demand-response" && (
            <DemandResponse 
              selectedSite={selectedSite}
              vppInvitations={vppInvitations}
              setVppInvitations={setVppInvitations}
              drPlans={drPlans}
              setDrPlans={setDrPlans}
              strategyGroups={strategyGroups}
              setStrategyGroups={setStrategyGroups}
              setNotifications={setNotifications}
              onGotoStrategyRun={() => setCurrentTab("strategy-run")}
            />
          )}

          {currentTab === "strategy-run" && (
            <StrategySchedule 
              selectedSite={selectedSite}
              strategyGroups={strategyGroups}
            />
          )}

          {currentTab === "sites" && (
            <SiteManagement 
              sites={sites}
              setSites={setSites}
              selectedSite={selectedSite}
              setSelectedSite={setSelectedSite}
            />
          )}

          {/* Under construction module placeholders */}
          {!["overview", "demand-response", "strategy-run", "sites"].includes(currentTab) && (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6 select-none font-sans">
              <div className="max-w-md bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center animate-pulse">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm">【天合富家 · 模块维护中】</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    您点击的导航项「<b>{currentTab}</b>」属于微网系统的既有外围板块。本期对接迭代已由薛易立发布，核心功能聚焦在：
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-left space-y-1.5 w-full text-[11px] font-medium text-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span><b>微网管理 -&gt; 需求响应：</b> 约定式削峰需求响应计划管理。(第一截图)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span><b>VPP调度：</b> 第三方虚拟电厂邀约接单、匹配户号、时段分割。(核心PRD)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span><b>微网管理 -&gt; 站点管理：</b> 配置/维护必要的电表户号。(必备前置)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span><b>策略管理 -&gt; 策略运行：</b> 策略排程日历及橙色色块查看。(第三截图)</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentTab("demand-response")}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition duration-150 shadow"
                >
                  去往核心 VPP 需求响应模块
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
