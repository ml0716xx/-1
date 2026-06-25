/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Zap, 
  Workflow, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  FileCheck2,
  CalendarDays
} from "lucide-react";
import { Site, VppInvitation, DrPlan, VppStatus } from "../types";

interface OverviewProps {
  selectedSite: Site;
  vppInvitations: VppInvitation[];
  drPlans: DrPlan[];
  setCurrentTab: (tab: string) => void;
}

export default function Overview({
  selectedSite,
  vppInvitations,
  drPlans,
  setCurrentTab
}: OverviewProps) {
  // Stats summary counts
  const pendingVppCount = vppInvitations.filter(v => v.status === VppStatus.PENDING_CONFIRM).length;
  const totalPlans = drPlans.length;
  const activeExecutionPlan = drPlans.find(p => p.status === "执行中");

  return (
    <div className="flex-grow p-6 bg-gray-50 flex flex-col space-y-6 select-none overflow-y-auto font-sans" id="overview-workspace">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-850 to-[#0e273c] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        {/* Background SVG decorative shapes for high-tech microgrid feeling */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 select-none pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L50,40 L100,100 Z" fill="currentColor" />
            <path d="M30,100 L80,20 L100,100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="space-y-1 z-10">
          <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
            微网智能排机 · 虚拟电厂直通通道
          </span>
          <h2 className="text-xl font-extrabold tracking-tight">智能微网与 VPP 协同调度概览门户</h2>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            协同管理分布式发电、全固态储能与柔性负荷。基于电网「电表户号」进行电价套利及需求响应(VPP)邀约一气呵成。
          </p>
        </div>

        {pendingVppCount > 0 && (
          <div className="mt-4 z-10 bg-amber-500/25 border border-amber-500/30 text-amber-100 rounded-lg p-3 flex items-center justify-between text-xs font-semibold animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              <span>当前检测到 <strong>{pendingVppCount} 个</strong> 来自外部虚拟电厂的削峰调频需求响应邀约，请及时确认！</span>
            </div>
            <button 
              onClick={() => setCurrentTab("demand-response")}
              className="bg-amber-500 hover:bg-amber-600 font-bold px-3 py-1 rounded text-white flex items-center space-x-1 shadow transition cursor-pointer"
            >
              <span>立即去编排</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">当前操作站点负荷</span>
            <span className="text-lg font-mono font-extrabold text-gray-900 leading-none">{selectedSite.currentLoad} <span className="text-xs font-sans font-medium text-gray-500">kW</span></span>
            <span className="text-[10px] text-gray-400 block mt-0.5">宿主名称: {selectedSite.name}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">站内储能电池 SOC</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono font-extrabold text-gray-900 leading-none">{selectedSite.storageSoc}%</span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${selectedSite.storageSoc}%` }} />
              </div>
            </div>
            <span className="text-[10px] text-teal-600 block mt-0.5">电化学储能通讯良好</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Workflow className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">关联电表户号</span>
            <span className={`text-md font-mono font-bold leading-none block mt-0.5 ${selectedSite.meterNo ? "text-indigo-800" : "text-rose-500"}`}>
              {selectedSite.meterNo || "【未维护：不可调度】"}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">对接调度全局唯一键码</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block">运行中策略排班</span>
            <span className="text-xs font-bold text-gray-800 block mt-0.5">{selectedSite.currentActiveStrategy}</span>
            <span className="text-[10px] text-teal-600 block">自动下发已生效</span>
          </div>
        </div>

      </div>

      {/* Main split: testing tips and roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Quicklinks and Flow */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">虚拟电厂对接与策略副本编排验证指南</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            本系统完美复现了 PRD V1.5 约定的<b>「虚拟电厂调度邀约-自动临时策略复制-原策略时段拆分-自动下发」</b>全生命周期流程。请按以下路径体验闭环测试：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <span className="text-teal-600 font-bold block">1. 验证户号前置机理</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                在右上方切换操作站点到 <b>[红星生产二站]</b> （其电表户号初始为空）。点击前往确认需求，系统将予以拦截。可去【站点管理】为他补齐户号。
              </p>
              <button 
                onClick={() => setCurrentTab("sites")}
                className="text-teal-600 hover:underline font-bold inline-block text-[10px] mt-1"
              >
                前往站点管理 →
              </button>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <span className="text-teal-600 font-bold block">2. 同意分配与策略拆分</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                切换回 <b>[双黄蛋]</b>。进入VPP邀约，点击“同意参与”。系统会复制当天的策略，并在重叠的 14:00-16:00 截出最高优先级需求响应。
              </p>
              <button 
                onClick={() => setCurrentTab("demand-response")}
                className="text-teal-600 hover:underline font-bold inline-block text-[10px] mt-1"
              >
                前往VPP邀约页 →
              </button>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <span className="text-teal-600 font-bold block">3. 策略排期验证</span>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                同意后，进入【策略运行】日历，您将在对应日期上看见新增的 <b>“临时策略副本”</b> 橙色色块。全程不改动原策略的基础配置。
              </p>
              <button 
                onClick={() => setCurrentTab("strategy-run")}
                className="text-teal-600 hover:underline font-bold inline-block text-[10px] mt-1"
              >
                前往策略排班 →
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-teal-50 border border-teal-100/50 rounded-xl text-teal-800 text-[11px] flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              已为您激活 <strong>3 个高保真展示站点</strong>。数据保存在本地浏览器中，所有的同意、拒绝、搜索以及仪表盘刷新都会即时产生业务流。
            </span>
          </div>
        </div>

        {/* Live system state timeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-sm">需求响应 (VPP通道) 状态跟踪</h3>
            <span className="text-[10px] text-gray-400">实时通信下发日志及追踪</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] text-xs font-sans">
            
            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <div className="w-0.5 h-10 bg-gray-100" />
              </div>
              <div className="font-medium space-y-0.5">
                <span className="text-gray-400 block text-[9px] font-mono">10:42 PM UTC</span>
                <span className="text-gray-800 font-bold block">系统与南方电网VPP完成幂等通讯校验</span>
                <p className="text-[11px] text-gray-500 leading-normal">安全证书匹配成功，获取邀约 VPP-2026-003 信道端口</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="w-0.5 h-10 bg-gray-100" />
              </div>
              <div className="font-medium space-y-0.5">
                <span className="text-gray-400 block text-[9px] font-mono font-semibold">10:00 PM UTC</span>
                <span className="text-gray-800 font-bold block">接收邀约并派至待确认收件箱</span>
                <p className="text-[11px] text-gray-500 leading-normal">VPP 邀约推送通过电表户号「9510048231」成功定位站点 [双黄蛋]</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
              <div className="font-medium space-y-0.5">
                <span className="text-gray-400 block text-[9px] font-mono">09:00 AM UTC</span>
                <span className="text-gray-800 font-bold block">华东电力调峰 VPP_2026-06-04 已执行完毕并反馈</span>
                <p className="text-[11px] text-gray-500 leading-normal">核算实际响应容量 42.0 kW，效率达 105.0%，结算￥134.40元发送至电网，执行数据已通过标准回调流回吐</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
