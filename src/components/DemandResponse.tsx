/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  RotateCcw, 
  RefreshCw,
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  FileText, 
  Calendar, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Briefcase
} from "lucide-react";
import { Site, VppInvitation, DrPlan, DrPlanType, VppStatus, StrategyGroup, SystemNotification } from "../types";
import { initialVppInvitations, initialDrPlans, initialStrategyGroups } from "../data";

interface DemandResponseProps {
  selectedSite: Site;
  vppInvitations: VppInvitation[];
  setVppInvitations: React.Dispatch<React.SetStateAction<VppInvitation[]>>;
  drPlans: DrPlan[];
  setDrPlans: React.Dispatch<React.SetStateAction<DrPlan[]>>;
  strategyGroups: StrategyGroup[];
  setStrategyGroups: React.Dispatch<React.SetStateAction<StrategyGroup[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  onGotoStrategyRun: () => void;
}

export default function DemandResponse({
  selectedSite,
  vppInvitations,
  setVppInvitations,
  drPlans,
  setDrPlans,
  strategyGroups,
  setStrategyGroups,
  setNotifications,
  onGotoStrategyRun
}: DemandResponseProps) {
  // Current Subtab
  const [subTab, setSubTab] = useState<"plans" | "vpp">("plans");

  // Helper to format timeslot for table display matching the image (e.g. "14:00-14:15" -> "14:15")
  const getDisplayTimeslot = (timeslot: string): string => {
    if (timeslot.includes("-")) {
      return timeslot.split("-")[1];
    }
    return timeslot;
  };

  // Plan search state
  const [searchPlanName, setSearchPlanName] = useState("");
  const [searchDateStart, setSearchDateStart] = useState("");
  const [searchDateEnd, setSearchDateEnd] = useState("");

  // VPP filter state
  const [filterVppStatus, setFilterVppStatus] = useState("全部");
  const [intervalDeclarations, setIntervalDeclarations] = useState<{ timeslot: string; capacity: string; price: string; }[]>([]);

  // Plan Modal state
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formInviteDate, setFormInviteDate] = useState("2026-06-08");
  const [formStartTime, setFormStartTime] = useState("14:00");
  const [formEndTime, setFormEndTime] = useState("16:00");
  const [formPeriods, setFormPeriods] = useState<string[]>(["14:00-16:00"]);
  const [formCapacity, setFormCapacity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formError, setFormError] = useState("");

  // Plan Detail Modal
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<DrPlan | null>(null);

  // VPP Invitation secondary confirm
  const [selectedVppToConfirm, setSelectedVppToConfirm] = useState<VppInvitation | null>(null);
  const [vppActionType, setVppActionType] = useState<"agree" | "reject" | null>(null);
  const [reasonMsg, setReasonMsg] = useState("");
  const [declaredCapacity, setDeclaredCapacity] = useState("");
  const [declaredPrice, setDeclaredPrice] = useState("");

  // Multiple response periods popover/modal state
  const [periodsToShow, setPeriodsToShow] = useState<{ id: string; planName: string; date: string; periods: string[] } | null>(null);

  // Feedback Notification Message
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "warning" | "info"; text: string } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset Plan Filters
  const handleResetFilters = () => {
    setSearchPlanName("");
    setSearchDateStart("");
    setSearchDateEnd("");
    triggerToast("搜索过滤项已重置", "success");
  };

  // Reset VPP status to standard initial dataset
  const handleResetVppStatus = () => {
    setVppInvitations(initialVppInvitations);
    setDrPlans(initialDrPlans);
    setStrategyGroups(initialStrategyGroups);
    triggerToast("已成功将所有 VPP 调度邀约操作、微网方案和派生策略副本重置回初始就绪状态！", "success");
  };

  // Filter plans list
  const filteredPlans = drPlans.filter((plan) => {
    // Check name matching
    if (searchPlanName && !plan.name.toLowerCase().includes(searchPlanName.toLowerCase())) {
      return false;
    }
    // Check date boundaries
    if (searchDateStart && plan.responseDate < searchDateStart) return false;
    if (searchDateEnd && plan.responseDate > searchDateEnd) return false;
    return true;
  });

  // Filter VPP invitations
  const filteredInvitations = vppInvitations.filter((vpp) => {
    if (filterVppStatus !== "全部" && vpp.status !== filterVppStatus) return false;
    return true;
  });

  // Handle Create Plan step 1 next
  const handlePlanNextStep = () => {
    if (!formName || !formDate || formPeriods.length === 0 || !formCapacity || !formPrice) {
      setFormError("请完整填写所有必填字段 (*)，且至少添加一个响应时段");
      return;
    }
    setFormError("");
    setFormStep(2);
  };

  // Handle Save Manual Plan
  const handleSaveManualPlan = () => {
    if (formPeriods.length === 0) {
      triggerToast("请添加至少一个响应时段！", "error");
      return;
    }
    const payload: DrPlan = {
      id: "plan_" + Date.now(),
      name: formName,
      type: DrPlanType.MANUAL,
      responseDate: formDate,
      responsePeriod: formPeriods.join(", "),
      targetCapacity: parseFloat(formCapacity),
      baselineAvgLoad: 180.00, // mock baseline load
      baselineMaxLoad: 240.00,
      status: "待执行"
    };

    // Check conflict for that date and time overlap
    const hasOverlap = drPlans.some(p => 
      p.responseDate === payload.responseDate && 
      p.status !== "已完成" &&
      isTimeOverlapping(p.responsePeriod, payload.responsePeriod)
    );

    if (hasOverlap) {
      triggerToast(`该时段与已生效的需求响应计划存在时间重叠，无法创建！`, "error");
      return;
    }

    setDrPlans([payload, ...drPlans]);
    setShowAddPlanModal(false);
    resetPlanForm();
    triggerToast(`成功手动制定削峰需求响应计划: ${payload.name}`, "success");
  };

  // Helper: check time overlap between two period strings (which could contain multiple comma-separated periods)
  const isTimeOverlapping = (period1: string, period2: string): boolean => {
    try {
      const parts1 = period1.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
      const parts2 = period2.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
      
      const parseInterval = (part: string) => {
        const [startStr, endStr] = part.split("-");
        const [sH, sM] = startStr.split(":").map(Number);
        const [eH, eM] = endStr.split(":").map(Number);
        return { start: sH * 60 + sM, end: eH * 60 + eM };
      };

      const intervals1 = parts1.map(parseInterval);
      const intervals2 = parts2.map(parseInterval);

      for (const i1 of intervals1) {
        for (const i2 of intervals2) {
          if (i1.start < i2.end && i2.start < i1.end) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper: split "HH:mm-HH:mm" (possibly multiple, separated by commas) into 15-minute intervals
  const generate15MinIntervals = (responsePeriod: string): string[] => {
    try {
      const parts = responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
      const allIntervals: string[] = [];
      
      for (const part of parts) {
        const [startStr, endStr] = part.split("-");
        const [startH, startM] = startStr.split(":").map(Number);
        const [endH, endM] = endStr.split(":").map(Number);
        
        let currentMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;
        
        while (currentMin + 15 <= endMin) {
          const nextMin = currentMin + 15;
          
          const formatTime = (min: number) => {
            const h = Math.floor(min / 60).toString().padStart(2, "0");
            const m = (min % 60).toString().padStart(2, "0");
            return `${h}:${m}`;
          };
          
          allIntervals.push(`${formatTime(currentMin)}-${formatTime(nextMin)}`);
          currentMin = nextMin;
        }
      }
      return allIntervals;
    } catch {
      return [];
    }
  };

  const resetPlanForm = () => {
    setFormStep(1);
    setFormName("");
    setFormDate("");
    setFormStartTime("14:00");
    setFormEndTime("16:00");
    setFormPeriods(["14:00-16:00"]);
    setFormCapacity("");
    setFormPrice("");
    setFormError("");
  };

  // Handle Delete Plan (Section 1.5 "不可编辑/不可删除的限制仅针对VPP邀约自动生成的计划")
  const handleDeletePlan = (id: string) => {
    const target = drPlans.find(p => p.id === id);
    if (!target) return;

    if (target.type === DrPlanType.VPP) {
      triggerToast("❌ VPP自动创建的需求响应计划不可编辑和删除，以确保虚拟电厂侧调度完整性", "error");
      return;
    }

    if (confirm(`确定要删除需求响应计划「${target.name}」吗？该操作不可逆。`)) {
      setDrPlans(drPlans.filter((p) => p.id !== id));
      triggerToast("计划已删除", "success");
    }
  };

  // Confirm VPP invitation implementation (Section 1.2 "同意后面的自动创建流程")
  const handleVppActionConfirm = () => {
    if (!selectedVppToConfirm) return;
    const vpp = selectedVppToConfirm;

    // AGREE/PARTICIPATE PROCESS
    // Step 1: Validate active site has Meter Number (电表户号)
    const meterNoCheck = selectedSite.meterNo ? selectedSite.meterNo.trim() : "";
    if (!meterNoCheck) {
      triggerToast(
        `电表户号无效或该站点 [${selectedSite.name}] 未配置电表户号！无法参与虚拟电厂调度。请前往“站点管理”模块配置该站点的电表户号。`,
        "error"
      );
      return;
    }

    // Step 2: Validate declared capacity and declared price inputs for each interval
    for (let i = 0; i < intervalDeclarations.length; i++) {
      const item = intervalDeclarations[i];
      const capTrim = item.capacity.trim();
      const prcTrim = item.price.trim();
      const hasCap = capTrim !== "";
      const hasPrc = prcTrim !== "";

      if (hasCap && !hasPrc) {
        triggerToast(`时段 [${getDisplayTimeslot(item.timeslot)}] 已填写报量，必须填写报价！`, "error");
        return;
      }
      if (!hasCap && hasPrc) {
        triggerToast(`时段 [${getDisplayTimeslot(item.timeslot)}] 已填写报价，必须填写报量！`, "error");
        return;
      }

      if (hasCap && hasPrc) {
        const capVal = parseFloat(capTrim);
        const prcVal = parseFloat(prcTrim);
        if (isNaN(capVal) || capVal <= 0) {
          triggerToast(`时段 [${getDisplayTimeslot(item.timeslot)}] 的可参与容量请输入大于0的有效数值！`, "error");
          return;
        }
        if (isNaN(prcVal) || prcVal <= 0) {
          triggerToast(`时段 [${getDisplayTimeslot(item.timeslot)}] 的申报价请输入大于0的有效数值！`, "error");
          return;
        }
        if (prcVal > vpp.subsidyPrice) {
          triggerToast(`时段 [${getDisplayTimeslot(item.timeslot)}] 的报价不能高于最高限价 ￥${vpp.subsidyPrice.toFixed(2)} 元/kWh！`, "error");
          return;
        }
      }
    }

    const filledIntervals = intervalDeclarations.filter(
      item => item.capacity.trim() !== "" && item.price.trim() !== ""
    );

    if (filledIntervals.length === 0) {
      triggerToast("请至少填写一个时段的报量与报价！", "error");
      return;
    }

    // Calculate averages across filled intervals
    const sumCap = filledIntervals.reduce((sum, item) => sum + parseFloat(item.capacity), 0);
    const avgCap = sumCap / filledIntervals.length;

    const sumPrc = filledIntervals.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const avgPrc = sumPrc / filledIntervals.length;

    const finalIntervals = filledIntervals.map(item => ({
      timeslot: item.timeslot,
      capacity: parseFloat(item.capacity),
      price: parseFloat(item.price)
    }));

    // Step 3: Conflict detection (同一站点同一响应时段最多允许一个需求响应执行, VPP 临时策略与手动计划互斥)
    const hasConflict = drPlans.some(
      (p) =>
        p.responseDate === vpp.responseDate &&
        p.status !== "已完成" &&
        isTimeOverlapping(p.responsePeriod, vpp.responsePeriod)
    );

    if (hasConflict) {
      triggerToast(
        `该时段 [${vpp.responseDate} ${vpp.responsePeriod}] 已存在手动创建的需求响应计划或已有其他 VPP 需求响应任务，无法创建策略任务！`,
        "error"
      );
      return;
    }

    // Step 4: Move to "CONFIRMING" (确认中) Status
    setVppInvitations((prev) =>
      prev.map((item) => (item.id === vpp.id ? { 
        ...item, 
        status: VppStatus.CONFIRMING,
        declaredCapacity: avgCap,
        declaredPrice: avgPrc,
        intervalDeclarations: finalIntervals
      } : item))
    );

    // Step 5: Raise System Notification
    setNotifications((prev) => [
      {
        id: "sys_dr_confirming_" + Date.now(),
        title: `需求响应报价报量信息已提交`,
        type: "invitation_new",
        content: `针对 ${vpp.responseDate} ${vpp.responsePeriod} 的调度邀约已完成分段报价报量：各时段平均申报容量 ${avgCap.toFixed(1)} kW，平均申报报价 ￥${avgPrc.toFixed(2)}。当前状态为「确认中」，正在等待回调响应...`,
        timestamp: "2026-06-08 10:41",
        isRead: false
      },
      ...prev
    ]);

    triggerToast(`报价报量提交成功！邀约状态已变更为「确认中」，请在下方列表中点击「模拟回调成功」模拟电厂回调并下发排程！`, "success");
    setSelectedVppToConfirm(null);
  };

  // Reject VPP invitation implementation
  const handleVppReject = () => {
    if (!selectedVppToConfirm) return;
    const vpp = selectedVppToConfirm;

    if (!reasonMsg.trim()) {
      triggerToast("请填写拒绝原因！", "error");
      return;
    }

    // Update invitation state
    setVppInvitations((prev) =>
      prev.map((item) => (item.id === vpp.id ? { ...item, status: VppStatus.REJECTED } : item))
    );
    // Log notification
    setNotifications((prev) => [
      {
        id: "sys_" + Date.now(),
        title: `已拒绝需求响应邀约`,
        type: "exec_exception",
        content: `已拒绝 响应日期 ${vpp.responseDate} 的调度邀约：${reasonMsg.trim()}。`,
        timestamp: "2026-06-08 10:45",
        isRead: false
      },
      ...prev
    ]);
    triggerToast(`已成功拒绝需求响应调度邀约`, "warning");
    setSelectedVppToConfirm(null);
    setReasonMsg("");
  };

  // Mock receiving the VPP callback response successfully
  const handleVppCallbackMock = (vpp: VppInvitation) => {
    // Step 1: Validate active site has Meter Number (电表户号)
    const meterNoCheck = selectedSite.meterNo ? selectedSite.meterNo.trim() : "";
    if (!meterNoCheck) {
      triggerToast(
        `电表户号无效或该站点 [${selectedSite.name}] 未配置电表户号！无法进行回调确认。`,
        "error"
      );
      return;
    }

    // Calculate final revenue based on interval declarations
    let finalRevenue = 0;
    if (vpp.intervalDeclarations && vpp.intervalDeclarations.length > 0) {
      finalRevenue = vpp.intervalDeclarations.reduce((sum, item) => sum + item.capacity * item.price * 0.25, 0);
    } else {
      const finalCapacity = vpp.declaredCapacity || vpp.targetCapacity;
      const finalPrice = vpp.declaredPrice || vpp.subsidyPrice;
      // parse period
      let hours = 0;
      try {
        const parts = vpp.responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
          const [startStr, endStr] = part.split("-");
          const [sh, sm] = startStr.split(":").map(Number);
          const [eh, em] = endStr.split(":").map(Number);
          hours += (eh * 60 + em - (sh * 60 + sm)) / 60;
        }
      } catch {
        hours = 2;
      }
      finalRevenue = finalCapacity * finalPrice * hours;
    }

    const finalCapacity = vpp.declaredCapacity || vpp.targetCapacity;
    const finalPrice = vpp.declaredPrice || vpp.subsidyPrice;

    // Step 2: Conflict detection
    const hasConflict = drPlans.some(
      (p) =>
        p.responseDate === vpp.responseDate &&
        p.status !== "已完成" &&
        isTimeOverlapping(p.responsePeriod, vpp.responsePeriod)
    );

    if (hasConflict) {
      triggerToast(
        `该时段 [${vpp.responseDate} ${vpp.responsePeriod}] 已存在手动创建的需求响应计划或已有其他 VPP 需求响应任务，无法创建策略任务！`,
        "error"
      );
      return;
    }

    // Step 3: Success simulations
    // A. Create the linked DR plan using final capacity and final price
    const newDrPlan: DrPlan = {
      id: "plan_" + Date.now(),
      name: vpp.planName,
      type: DrPlanType.VPP,
      responseDate: vpp.responseDate,
      responsePeriod: vpp.responsePeriod,
      targetCapacity: finalCapacity,
      baselineAvgLoad: 285.00,
      baselineMaxLoad: 360.00,
      status: "待执行",
      vppInvitationId: vpp.id,
      meterNo: meterNoCheck,
      profit: finalRevenue
    };

    setDrPlans([newDrPlan, ...drPlans]);

    // B. Copy active strategy of today & segment (时段分割)
    const originActiveGroup = strategyGroups.find(sg => sg.dateActive === "2026-06-08") || strategyGroups[strategyGroups.length - 1];
    const periods = vpp.responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
    let vppStart = "14:00";
    let vppEnd = "16:00";
    if (periods.length > 0) {
      vppStart = periods[0].split("-")[0];
      vppEnd = periods[periods.length - 1].split("-")[1];
    }
    
    const splitGroup: StrategyGroup = {
      id: "sg_vpp_split" + Date.now(),
      name: `临时_${vpp.responseDate.replace(/-/g, "").substring(4)} 策略组合01`,
      status: "待生效",
      dateActive: vpp.responseDate,
      isTemporary: true,
      strategies: [
        { id: "st_split_1", name: "时段1", type: "削峰填谷", timeslot: `00:00-${vppStart}`, priority: 1, chargeReserve: 10, dischargeReserve: 3 },
        { id: "st_split_vpp", name: "VPP需求响应(最高级)", type: "需求响应", timeslot: vpp.responsePeriod, priority: 100, isTemporary: true },
        { id: "st_split_2", name: "时段2", type: "动态增容", timeslot: `${vppEnd}-24:00`, priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 }
      ]
    };

    setStrategyGroups([...strategyGroups, splitGroup]);

    // C. Update VppInvitation Status to AGREED and save actual calculated revenue
    setVppInvitations((prev) =>
      prev.map((item) => (item.id === vpp.id ? { 
        ...item, 
        status: VppStatus.AGREED,
        refRevenue: finalRevenue // Update reference revenue to match new bid
      } : item))
    );

    // D. Raise System Notification
    setNotifications((prev) => [
      {
        id: "sys_dr_confirm_" + Date.now(),
        title: `调度回调确认通过`,
        type: "strategy_created",
        content: `虚拟电厂已回调确认通过报量（申报容量: ${finalCapacity.toFixed(1)} kW，申报单价: ￥${finalPrice.toFixed(2)}/kWh）。需求响应策略 [${splitGroup.name}] 已成功下发，将于 ${vpp.responseDate} ${vpp.responsePeriod} 覆盖原策略。`,
        timestamp: "2026-06-08 10:43",
        isRead: false
      },
      ...prev
    ]);

    triggerToast(`虚拟电厂回调响应确认成功！已根据您的报量报价完成原策略时段分割与VPP策略编排！`, "success");
  };

  return (
    <div className="flex-grow p-6 bg-gray-50 flex flex-col overflow-y-auto space-y-6 select-none font-sans" id="vpp-core-workspace">
      
      {/* Toast Feedback Notification Overlay */}
      {toastMessage && (
        <div className={`fixed top-4 right-1/2 translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border animate-fade-in ${
          toastMessage.type === "success" 
            ? "bg-teal-50 border-teal-200 text-teal-800"
            : toastMessage.type === "error"
            ? "bg-rose-50 border-rose-200 text-rose-800"
            : toastMessage.type === "info"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span className="font-semibold text-xs leading-relaxed">{toastMessage.text}</span>
        </div>
      )}

      {/* Header and statistics panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">约定式需求响应管理</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            对接外部虚拟电厂 (VPP) 平台的调度邀约，支持需求分配、策略副本分割与执行指标溯源。
          </p>
        </div>
        <div className="flex space-x-2 mt-3 md:mt-0">
          <button 
            onClick={() => setSubTab("plans")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
              subTab === "plans" 
                ? "bg-teal-50 text-teal-700 border-teal-200 shadow-sm" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            需求响应计划列表
          </button>
          <button 
            onClick={() => setSubTab("vpp")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition relative ${
              subTab === "vpp" 
                ? "bg-teal-50 text-teal-700 border-teal-200 shadow-sm" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            VPP 调度邀约管理
            {vppInvitations.filter(v => v.status === VppStatus.PENDING_CONFIRM).length > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {vppInvitations.filter(v => v.status === VppStatus.PENDING_CONFIRM).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {subTab === "plans" ? (
        <>
          {/* Query Filters - First screenshot */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <div className="flex flex-col space-y-1 min-w-[200px]">
              <label className="text-gray-500 font-medium font-sans">计划名称</label>
              <input 
                type="text" 
                value={searchPlanName}
                onChange={(e) => setSearchPlanName(e.target.value)}
                placeholder="请输入计划名称"
                className="border border-gray-200 rounded-md px-3 py-1.5 focus:border-teal-500 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-gray-500 font-medium">响应日期范围</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="date" 
                  value={searchDateStart}
                  onChange={(e) => setSearchDateStart(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 focus:border-teal-500 focus:outline-none focus:ring-0 max-w-[140px]"
                />
                <span className="text-gray-400">至</span>
                <input 
                  type="date" 
                  value={searchDateEnd}
                  onChange={(e) => setSearchDateEnd(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 focus:border-teal-500 focus:outline-none focus:ring-0 max-w-[140px]"
                />
              </div>
            </div>

            <div className="flex items-end h-full self-end space-x-2 pl-2">
              <button 
                onClick={() => triggerToast("查询完成", "success")}
                className="bg-teal-600 hover:bg-teal-700 font-semibold px-4 py-2 rounded-lg text-white font-sans flex items-center space-x-1 shadow-sm leading-none cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>查询</span>
              </button>
              <button 
                onClick={handleResetFilters}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-800">需求响应列表</span>
                <span className="text-[11px] text-gray-400 font-mono">共 {filteredPlans.length} 条数据</span>
              </div>
              <button 
                onClick={() => {
                  if (!selectedSite.meterNo) {
                    triggerToast("建议前往【站点管理】为其维护电表户号，虽然手动计划不强制，但VPP调度必须绑定户号！", "warning");
                  }
                  setShowAddPlanModal(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1 shadow transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增计划</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/75 text-gray-500 font-medium uppercase font-sans border-b border-gray-100">
                    <th className="py-3 px-4 text-center">序号</th>
                    <th className="py-3 px-4">计划名称</th>
                    <th className="py-3 px-4">创建类型</th>
                    <th className="py-3 px-4">响应日期</th>
                    <th className="py-3 px-4">响应时段</th>
                    <th className="py-3 px-4 text-right">目标响应容量 (kW)</th>
                    <th className="py-3 px-4 text-right">基线平均负荷 (kW)</th>
                    <th className="py-3 px-4 text-right">基线最大负荷 (kW)</th>
                    <th className="py-3 px-4 text-right">实际响应容量 (kW)</th>
                    <th className="py-3 px-4 text-right">响应平均负荷 (kW)</th>
                    <th className="py-3 px-4 text-right">响应最大负荷 (kW)</th>
                    <th className="py-3 px-4 text-right">响应效率 (%)</th>
                    <th className="py-3 px-4 text-right">参考收益 (元)</th>
                    <th className="py-3 px-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-8 text-center text-gray-400">
                        暂无符合搜索条件的需求响应计划数据
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan, idx) => (
                      <tr key={plan.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 text-center font-mono text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900 flex items-center space-x-1.5">
                          <span className="truncate max-w-[200px]" title={plan.name}>{plan.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            plan.type === DrPlanType.VPP 
                              ? "bg-rose-50 text-rose-700 border border-rose-100" 
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {plan.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{plan.responseDate}</td>
                        <td className="py-3 px-4 font-mono">
                          {(() => {
                            const periods = plan.responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
                            if (periods.length <= 3) {
                              return (
                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                  {periods.map((p, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10.5px] font-mono border border-gray-200">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              );
                            }
                            return (
                              <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                                {periods.slice(0, 3).map((p, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10.5px] font-mono border border-gray-200">
                                    {p}
                                  </span>
                                ))}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPeriodsToShow({
                                      id: plan.id,
                                      planName: plan.name,
                                      date: plan.responseDate,
                                      periods: periods
                                    });
                                  }}
                                  className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-1.5 py-0.5 rounded text-[10px] border border-teal-200 transition cursor-pointer"
                                >
                                  + {periods.length - 3} 个
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-teal-800">{plan.targetCapacity.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          {plan.baselineAvgLoad ? plan.baselineAvgLoad.toFixed(2) : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          {plan.baselineMaxLoad ? plan.baselineMaxLoad.toFixed(2) : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-teal-600 font-bold">
                          {plan.actualCapacity !== undefined ? plan.actualCapacity.toFixed(2) : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          {plan.avgLoad !== undefined ? plan.avgLoad.toFixed(2) : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-600">
                          {plan.maxLoad !== undefined ? plan.maxLoad.toFixed(2) : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-teal-800 font-semibold">
                          {plan.efficiency !== undefined ? `${plan.efficiency.toFixed(1)}%` : "--"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-700 font-bold">
                          {plan.profit !== undefined ? `￥${plan.profit.toFixed(2)}` : "--"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => setSelectedPlanDetail(plan)}
                              className="text-teal-600 hover:text-teal-700 font-medium hover:underline cursor-pointer"
                            >
                              详情
                            </button>
                            <button 
                              onClick={() => {
                                if (plan.type === DrPlanType.VPP) {
                                  triggerToast("VPP自动生成计划参数不可修改，已只读锁定数据完整性。", "warning");
                                } else {
                                  triggerToast("手动计划编辑，请直接在列表中双击操作", "info");
                                }
                              }}
                              className={`font-medium ${
                                plan.type === DrPlanType.VPP ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-teal-600"
                              }`}
                            >
                              编辑
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(plan.id)}
                              className={`font-medium ${
                                plan.type === DrPlanType.VPP ? "text-gray-300 cursor-not-allowed" : "text-rose-600 hover:text-rose-700 cursor-pointer"
                              }`}
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* VPP Invitation View filters */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <div className="flex flex-col space-y-1 min-w-[150px]">
              <label className="text-gray-500 font-medium">状态筛选</label>
              <select 
                value={filterVppStatus}
                onChange={(e) => setFilterVppStatus(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-1.5 focus:border-teal-500 focus:outline-none"
              >
                <option value="全部">全部状态</option>
                <option value="待确认">待确认 (NEW)</option>
                <option value="已同意">已同意</option>
                <option value="已拒绝">已拒绝</option>
                <option value="已过期">已过期</option>
                <option value="已完成">已完成交付</option>
              </select>
            </div>

            <div className="flex items-end self-end text-gray-500 font-medium md:ml-auto">
              当前关联站点名: <strong className="text-teal-900 border-b border-dashed border-teal-500 ml-1 pr-1">{selectedSite.name}</strong> 
              (户号: <strong className="text-gray-800 font-mono">{selectedSite.meterNo || "【未维护：无法确认调度!】"}</strong>)
            </div>

            <button
              onClick={handleResetVppStatus}
              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs text-xs self-end font-sans"
              title="一键将所有虚拟电厂邀约状态、需求响应策略及排班记录重置回未操作的初始态，以便重新测试演示"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置邀约操作状态</span>
            </button>
          </div>

          {/* Invitation Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <span className="font-bold text-gray-800">所有 VPP 需求回归及响应调度邀约</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <th className="py-3 px-4">邀约 ID</th>
                    <th className="py-3 px-4">计划名称</th>
                    <th className="py-3 px-4">响应日期</th>
                    <th className="py-3 px-4">响应时段</th>
                    <th className="py-3 px-4 text-right">目标容量 (kW)</th>
                    <th className="py-3 px-4 text-right">补贴价格 (元/kWh)</th>
                    <th className="py-3 px-4 text-right">预估/参考收益</th>
                    <th className="py-3 px-4 text-center">截止确认</th>
                    <th className="py-3 px-4 text-center">状态</th>
                    <th className="py-3 px-4 text-center">调度操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredInvitations.map((vpp) => {
                    const isPending = vpp.status === VppStatus.PENDING_CONFIRM;

                    return (
                      <tr key={vpp.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-500">{vpp.id}</td>
                        <td className="py-3.5 px-4 max-w-[180px] truncate" title={vpp.planName}>{vpp.planName}</td>
                        <td className="py-3.5 px-4 font-mono">{vpp.responseDate}</td>
                        <td className="py-3.5 px-4">
                          {(() => {
                            const periods = vpp.responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPeriodsToShow({
                                    id: vpp.id,
                                    planName: vpp.planName,
                                    date: vpp.responseDate,
                                    periods: periods
                                  });
                                }}
                                className="flex items-center space-x-1.5 bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-100 px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer"
                                title="点击查看时段明细"
                              >
                                <Clock className="w-3.5 h-3.5 text-teal-600" />
                                <span>共 {periods.length} 个时段</span>
                              </button>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800">{vpp.targetCapacity.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">￥{vpp.subsidyPrice.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-indigo-700 font-bold">￥{vpp.refRevenue.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center text-gray-400 font-mono text-[10px]">{vpp.expiryTime}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            vpp.status === VppStatus.PENDING_CONFIRM 
                              ? "bg-orange-50 text-orange-700 border border-orange-100 animate-pulse" 
                            : vpp.status === VppStatus.CONFIRMING
                              ? "bg-blue-50 text-blue-700 border border-blue-100 font-bold"
                              : vpp.status === VppStatus.AGREED
                              ? "bg-teal-50 text-teal-700 border border-teal-100"
                              : vpp.status === VppStatus.REJECTED
                              ? "bg-gray-100 text-gray-500 border border-gray-200"
                              : vpp.status === VppStatus.EXPIRED
                              ? "bg-rose-50 text-rose-400"
                              : "bg-emerald-50 text-emerald-800 font-bold border border-emerald-100"
                          }`}>
                            {vpp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {vpp.status === VppStatus.PENDING_CONFIRM ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button 
                                onClick={() => {
                                  setSelectedVppToConfirm(vpp);
                                  setDeclaredCapacity(vpp.targetCapacity.toString());
                                  setDeclaredPrice(vpp.subsidyPrice.toString());
                                  const intervals = generate15MinIntervals(vpp.responsePeriod);
                                  setIntervalDeclarations(intervals.map(t => ({
                                    timeslot: t,
                                    capacity: vpp.targetCapacity.toString(),
                                    price: vpp.subsidyPrice.toString()
                                  })));
                                  setReasonMsg("");
                                }}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] shadow-sm cursor-pointer transition duration-150"
                              >
                                参与
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedVppToConfirm(vpp);
                                  setDeclaredCapacity(vpp.targetCapacity.toString());
                                  setDeclaredPrice(vpp.subsidyPrice.toString());
                                  const intervals = generate15MinIntervals(vpp.responsePeriod);
                                  setIntervalDeclarations(intervals.map(t => ({
                                    timeslot: t,
                                    capacity: vpp.targetCapacity.toString(),
                                    price: vpp.subsidyPrice.toString()
                                  })));
                                  setReasonMsg("");
                                }}
                                className="bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-700 text-gray-600 px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                拒绝
                              </button>
                            </div>
                          ) : vpp.status === VppStatus.CONFIRMING ? (
                            <div className="flex items-center justify-center">
                              <button 
                                onClick={() => handleVppCallbackMock(vpp)}
                                className="bg-blue-600 hover:bg-blue-750 text-white font-bold px-2.5 py-1 rounded-md text-[10px] shadow-sm cursor-pointer flex items-center space-x-1 animate-pulse"
                                title="点击模拟外部电网对本次报量报价发出最终的回调批准，自动分割并下发执行策略"
                              >
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>模拟回调成功</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono text-[10px]">-- 已确认 --</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Manual New Plan Modal - Second screenshot */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-3xl overflow-hidden font-sans">
            {/* Modal Head */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/75">
              <span className="font-bold text-gray-800 text-sm">新增约定式削峰需求响应计划</span>
              <button 
                onClick={() => { resetPlanForm(); setShowAddPlanModal(false); }}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center justify-center px-12 py-6 border-b border-gray-50">
              <div className="flex items-center space-x-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                  formStep >= 1 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>1</span>
                <span className={`text-xs font-bold ${formStep >= 1 ? "text-teal-900" : "text-gray-400"}`}>基本信息</span>
              </div>
              <div className="flex-grow max-w-[120px] h-0.5 bg-gray-200 mx-4 relative">
                <div className={`absolute left-0 top-0 h-full bg-teal-600 transition-all ${formStep === 2 ? "w-full" : "w-0"}`} />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                  formStep === 2 ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-500"
                }`}>2</span>
                <span className={`text-xs font-bold ${formStep === 2 ? "text-teal-900" : "text-gray-400"}`}>调度参数预览</span>
              </div>
            </div>

            {/* Step 1 Form Content matching Second Screenshot */}
            {formStep === 1 ? (
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-medium flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>计划名称
                    </label>
                    <input 
                      type="text" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="8位字，限制中英文及数字"
                      className="border border-gray-200 rounded-md px-3 py-2 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>响应类型
                    </label>
                    <select 
                      disabled
                      className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-500 font-bold cursor-not-allowed"
                    >
                      <option>约定需求响应</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>邀约日期
                    </label>
                    <input 
                      type="date" 
                      value={formInviteDate}
                      onChange={(e) => setFormInviteDate(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 focus:border-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>响应日期
                    </label>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="border border-gray-200 rounded-md px-3 py-2 focus:border-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5 col-span-2 bg-teal-50/20 p-3 rounded-lg border border-teal-500/10">
                    <label className="text-gray-700 font-bold flex items-center justify-between">
                      <span className="flex items-center text-xs">
                        <span className="text-rose-500 mr-1">*</span>响应时段列表（支持多个非连续时段）
                      </span>
                      <span className="text-[10.5px] text-gray-400 font-normal">
                        请添加至少一个时段
                      </span>
                    </label>
                    
                    {/* Add new period input row */}
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-150">
                      <div className="flex items-center space-x-1 flex-grow text-xs">
                        <span className="text-gray-400 font-medium">开始:</span>
                        <input 
                          type="time" 
                          value={formStartTime}
                          onChange={(e) => setFormStartTime(e.target.value)}
                          className="border border-gray-200 hover:border-teal-500 focus:border-teal-600 rounded-md px-1.5 py-1 focus:outline-none font-mono text-center text-xs w-24 bg-gray-50/50"
                        />
                        <span className="text-gray-400 font-medium ml-1">结束:</span>
                        <input 
                          type="time" 
                          value={formEndTime}
                          onChange={(e) => setFormEndTime(e.target.value)}
                          className="border border-gray-200 hover:border-teal-500 focus:border-teal-600 rounded-md px-1.5 py-1 focus:outline-none font-mono text-center text-xs w-24 bg-gray-50/50"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (!formStartTime || !formEndTime) {
                            triggerToast("请选择开始和结束时间！", "error");
                            return;
                          }
                          const [sh, sm] = formStartTime.split(":").map(Number);
                          const [eh, em] = formEndTime.split(":").map(Number);
                          if (sh * 60 + sm >= eh * 60 + em) {
                            triggerToast("结束时间必须晚于开始时间！", "error");
                            return;
                          }
                          const newPeriod = `${formStartTime}-${formEndTime}`;
                          
                          // Check overlap
                          const isOverlap = isTimeOverlapping(newPeriod, formPeriods.join(", "));
                          if (isOverlap) {
                            triggerToast(`该时段与已添加的时段存在时间重叠！`, "error");
                            return;
                          }
                          
                          setFormPeriods(prev => [...prev, newPeriod].sort((a, b) => {
                            const [sa] = a.split("-");
                            const [sb] = b.split("-");
                            return sa.localeCompare(sb);
                          }));
                          triggerToast("成功添加响应时段", "success");
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1 rounded text-xs transition cursor-pointer"
                      >
                        + 添加时段
                      </button>
                    </div>

                    {/* Display of currently added periods */}
                    <div className="flex flex-wrap gap-1.5 min-h-[38px] bg-white border border-gray-200 rounded-lg p-2">
                      {formPeriods.length === 0 ? (
                        <span className="text-gray-400 italic text-[11px] self-center pl-1">暂无时段，请于上方选择并点击“添加时段”</span>
                      ) : (
                        formPeriods.map((period, index) => (
                          <div 
                            key={index}
                            className="flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-mono font-bold px-2 py-0.5 rounded text-[11px] transition duration-150 animate-fade-in"
                          >
                            <span>{period}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormPeriods(prev => prev.filter((_, i) => i !== index));
                                triggerToast("已移除该时段", "info");
                              }}
                              className="text-teal-600 hover:text-rose-600 p-0.5 rounded hover:bg-white/50 cursor-pointer transition"
                              title="移除"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>目标响应容量 (kW)
                    </label>
                    <input 
                      type="number" 
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      placeholder="请输入目标响应容量"
                      className="border border-gray-200 rounded-md px-3 py-2 focus:border-teal-500 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-gray-600 font-bold flex items-center">
                      <span className="text-rose-500 mr-1">*</span>补贴价格 (元/kWh)
                    </label>
                    <input 
                      type="number" 
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="请输入补贴单价费用"
                      className="border border-gray-200 rounded-md px-3 py-2 focus:border-teal-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Step 2 Preview
              <div className="p-6 space-y-4 text-xs font-sans">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-amber-900 flex space-x-2.5">
                  <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">EMS 策略发布安全性约束与核发声明</h4>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      自主新增削峰需求响应策略在执行期间将以「最高级别」发布至站点储能系统，在 {formDate} 的 {formPeriods.join("、")} 时段内对负荷做出物理压制，请确保该期间储能设备拥有充足的放电 SOC，并在负荷平移前仔细比对物理极限。
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-800">
                    编制明细预览
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-y-3 font-medium">
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">计划名称</span>
                      <span className="text-gray-800 font-bold">{formName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5 pl-4">
                      <span className="text-gray-400">响应日期</span>
                      <span className="text-gray-850 font-mono">{formDate}</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-50 pb-1.5 col-span-2">
                      <span className="text-gray-400">响应时间段 ({formPeriods.length} 个)</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[400px]">
                        {formPeriods.map((p, idx) => (
                          <span key={idx} className="bg-teal-50 border border-teal-100 text-teal-850 font-mono font-bold px-2 py-0.5 rounded text-[10.5px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">目标削峰负荷</span>
                      <span className="text-teal-700 font-bold font-mono">{formCapacity} kW</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5 pl-4">
                      <span className="text-gray-400">目标执行宿主</span>
                      <span className="text-gray-800">{selectedSite.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5 col-span-2">
                      <span className="text-gray-400">补贴单价 / 预估参考收益</span>
                      <span className="text-amber-700 font-bold">
                        ￥{parseFloat(formPrice || "0").toFixed(2)} 元/kWh 
                        <span className="text-[10px] text-gray-400 font-normal ml-1">
                          (预计得: ￥{(
                            parseFloat(formCapacity || "0") * 
                            parseFloat(formPrice || "0") * 
                            (() => {
                              let hours = 0;
                              try {
                                for (const part of formPeriods) {
                                  const [startStr, endStr] = part.split("-");
                                  const [sh, sm] = startStr.split(":").map(Number);
                                  const [eh, em] = endStr.split(":").map(Number);
                                  hours += (eh * 60 + em - (sh * 60 + sm)) / 60;
                                }
                              } catch {}
                              return hours || 2;
                            })()
                          ).toFixed(2)})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal footers */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end space-x-2 bg-gray-50/75">
              {formStep === 2 && (
                <button
                  onClick={() => setFormStep(1)}
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs transition animate-fade-in"
                >
                  上一步
                </button>
              )}
              <button
                onClick={() => { resetPlanForm(); setShowAddPlanModal(false); }}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs hover:bg-gray-50 transition cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={formStep === 1 ? handlePlanNextStep : handleSaveManualPlan}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow cursor-pointer"
              >
                {formStep === 1 ? "下一步" : "立即创建下发"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VPP Action Secondary Confirmation Modal */}
      {selectedVppToConfirm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center space-x-2 text-teal-850 bg-teal-50/50">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span className="font-bold font-sans text-sm text-teal-900">处理需求响应邀约（报价报量 / 拒绝）</span>
            </div>
            <div className="p-5 space-y-4 text-xs font-sans">
              {/* Subtitle Info */}
              <div className="flex flex-wrap justify-between items-center text-[10.5px] text-gray-500 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 gap-y-1">
                <div>
                  <span className="text-gray-400">响应日期：</span>
                  <span className="font-bold text-gray-700">{selectedVppToConfirm.responseDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">电表户号：</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {selectedSite.meterNo ? selectedSite.meterNo : `【未配置】`}
                  </span>
                </div>
              </div>

              {/* Top summary row */}
              <div className="flex justify-between items-center px-1 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-medium">总响应容量：</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">{selectedVppToConfirm.targetCapacity.toFixed(2)} kW</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-medium">最高限价：</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">￥{selectedVppToConfirm.subsidyPrice.toFixed(2)} / kWh</span>
                </div>
              </div>

              {/* Clean Grid-based Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-bold text-gray-600 border-b border-gray-200">
                      <th className="py-2.5 px-3 border-r border-gray-200 text-center w-1/3">时间段</th>
                      <th className="py-2.5 px-3 border-r border-gray-200 text-center w-1/3">报量</th>
                      <th className="py-2.5 px-3 text-center w-1/3">报价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intervalDeclarations.map((item, idx) => (
                      <tr key={item.timeslot} className="border-b border-gray-150 last:border-b-0 hover:bg-teal-50/10 transition-colors">
                        <td className="py-2 px-3 border-r border-gray-200 text-center font-mono font-bold text-gray-500 bg-gray-50/20 select-all">
                          {getDisplayTimeslot(item.timeslot)}
                        </td>
                        <td className="py-1 px-2 border-r border-gray-200">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="number"
                              value={item.capacity}
                              onChange={(e) => {
                                const val = e.target.value;
                                setIntervalDeclarations(prev => prev.map(d => d.timeslot === item.timeslot ? { ...d, capacity: val } : d));
                              }}
                              className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-teal-500 rounded px-2 py-1 text-center font-mono font-bold text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500/25"
                              placeholder="请输入报量"
                            />
                          </div>
                        </td>
                        <td className="py-1 px-2">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const val = e.target.value;
                                setIntervalDeclarations(prev => prev.map(d => d.timeslot === item.timeslot ? { ...d, price: val } : d));
                              }}
                              className={`w-full bg-white border rounded px-2 py-1 text-center font-mono font-bold text-xs focus:outline-none focus:ring-1 ${
                                parseFloat(item.price) > selectedVppToConfirm.subsidyPrice 
                                  ? "border-rose-300 text-rose-600 focus:border-rose-500 focus:ring-rose-500/25" 
                                  : "border-gray-200 hover:border-gray-300 focus:border-teal-500 focus:ring-teal-500/25 text-gray-800"
                              }`}
                              placeholder="请输入报价"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reject Reason Textarea Section */}
              <div className="space-y-1 bg-rose-50/30 rounded-lg p-3 border border-rose-100/50">
                <label className="text-[10.5px] text-gray-500 font-bold flex justify-between px-0.5">
                  <span>拒绝原因（拒绝邀约时必填）</span>
                </label>
                <textarea 
                  value={reasonMsg}
                  onChange={(e) => setReasonMsg(e.target.value)}
                  placeholder="如需拒绝该邀约，请在此输入原因。例如：储能备电故障、生产高负荷状态..."
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
            <div className="p-3.5 border-t border-gray-100 flex justify-end space-x-1.5 bg-gray-50/50">
              <button 
                onClick={() => { setSelectedVppToConfirm(null); setReasonMsg(""); }}
                className="bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition"
              >
                取消
              </button>
              <button 
                onClick={handleVppReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-[11px] shadow-sm cursor-pointer transition"
              >
                拒绝该邀约
              </button>
              <button 
                onClick={handleVppActionConfirm}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-[11px] shadow-sm cursor-pointer transition"
              >
                确认参与响应
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Detail / Timeline Chart Modal */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <span className="font-bold flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>需求响应计划详情 & 负荷核算曲线</span>
              </span>
              <button 
                onClick={() => setSelectedPlanDetail(null)}
                className="p-1 rounded-full hover:bg-teal-800 text-teal-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
              {/* Detailed specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100 font-medium font-sans">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2">计划明细规格</h4>
                  <div className="flex justify-between"><span className="text-gray-400">计划名称:</span><span className="text-gray-800 font-bold">{selectedPlanDetail.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">计划形式:</span><span className="text-gray-800 px-1.5 py-0.2 bg-teal-50 text-teal-700 font-bold rounded">{selectedPlanDetail.type}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">响应日期:</span><span className="text-gray-800 font-mono">{selectedPlanDetail.responseDate}</span></div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-400 whitespace-nowrap">响应时段:</span>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                      {selectedPlanDetail.responsePeriod.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean).map((p, idx) => (
                        <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-1 py-0.2 rounded text-[10px] font-mono font-bold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-400">目标削减负荷:</span><span className="text-teal-800 font-mono font-bold">{selectedPlanDetail.targetCapacity} kW</span></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100 font-medium">
                  <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-1 mb-2">执行结果核算</h4>
                  <div className="flex justify-between"><span className="text-gray-400">基线平均负荷:</span><span className="text-gray-800 font-mono">{selectedPlanDetail.baselineAvgLoad ? `${selectedPlanDetail.baselineAvgLoad} kW` : "--"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">实际响应负荷:</span><span className="text-teal-600 font-bold font-mono">{selectedPlanDetail.actualCapacity ? `${selectedPlanDetail.actualCapacity} kW` : "--"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">响应效率:</span><span className="text-indigo-600 font-bold font-mono">{selectedPlanDetail.efficiency ? `${selectedPlanDetail.efficiency.toFixed(1)}%` : "--"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">参考补贴结余:</span><span className="text-amber-700 font-bold font-mono">{selectedPlanDetail.profit ? `￥${selectedPlanDetail.profit.toFixed(2)}` : "--"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">电表户号标志:</span><span className="text-gray-800 font-mono">{selectedPlanDetail.meterNo || "手动暂无绑定"}</span></div>
                </div>
              </div>

              {/* Polished Visual SVG-based load curve */}
              <div className="space-y-2">
                <span className="font-bold text-gray-800">负荷调度及基线对比曲线（15分钟粒度）</span>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-950/95 relative overflow-hidden">
                  
                  {/* Legend */}
                  <div className="flex items-center space-x-4 mb-3 text-[10px] text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-0.5 bg-gray-400 inline-block" />
                      <span>基线负荷曲线</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-0.5 bg-teal-400 inline-block" />
                      <span>实际调频负荷</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="w-2.5 h-1 border-t border-dashed border-rose-400 inline-block" />
                      <span>响应目标电网峰值</span>
                    </div>
                    {selectedPlanDetail.status === "待执行" && (
                      <span className="text-orange-400 font-bold animate-pulse ml-auto">「预估曲线：待次日执行统计」</span>
                    )}
                  </div>

                  {/* SVG Chart */}
                  <svg viewBox="0 0 500 150" className="w-full h-36">
                    {/* Gridlines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#1d283c" id="grid-y1" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#1d283c" id="grid-y2" />
                    <line x1="40" y1="100" x2="480" y2="100" stroke="#1d283c" id="grid-y3" />
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#1d283c" id="grid-y4" />

                    {/* Peak boundary line during response slot (14:00 - 16:00 is around x:260 to x:360) */}
                    <line x1="240" y1="100" x2="340" y2="100" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                  
                    {/* Baseline curve (gray path) */}
                    <path 
                      d="M 40 110 Q 100 80 150 70 T 250 50 T 320 60 T 400 90 T 480 120" 
                      fill="none" 
                      stroke="#64748b" 
                      strokeWidth="2" 
                    />

                    {/* Actual/Simulated Responsive load (Teal path, dropping significantly during response slot) */}
                    <path 
                      d="M 40 110 Q 100 81 150 72 T 240 76 L 250 110 L 330 110 L 340 74 T 400 91 T 480 121" 
                      fill="none" 
                      stroke="#2dd4bf" 
                      strokeWidth="2.5" 
                    />

                    {/* Critical time indicators on X axis */}
                    <text x="40" y="145" fill="#475569" fontSize="8" textAnchor="middle">00:00</text>
                    <text x="140" y="145" fill="#475569" fontSize="8" textAnchor="middle">08:00</text>
                    <text x="240" y="145" fill="#2dd4bf" fontSize="8" textAnchor="middle" className="font-bold">14:00 (开始)</text>
                    <text x="340" y="145" fill="#2dd4bf" fontSize="8" textAnchor="middle" className="font-bold">16:00 (结束)</text>
                    <text x="430" y="145" fill="#475569" fontSize="8" textAnchor="middle">20:00</text>
                    <text x="480" y="145" fill="#475569" fontSize="8" textAnchor="middle">24:00</text>

                    {/* kW labels on Y axis */}
                    <text x="32" y="24" fill="#475569" fontSize="8" textAnchor="end">500kW</text>
                    <text x="32" y="64" fill="#475569" fontSize="8" textAnchor="end">300kW</text>
                    <text x="32" y="104" fill="#475569" fontSize="8" textAnchor="end">100kW</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-gray-100 flex justify-end space-x-1.5 bg-gray-50/75">
              <button 
                onClick={() => setSelectedPlanDetail(null)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Response Periods Modal */}
      {periodsToShow && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-900 text-white">
              <span className="font-bold flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>邀约响应时段明细</span>
              </span>
              <button 
                onClick={() => setPeriodsToShow(null)}
                className="p-1 rounded-full hover:bg-teal-800 text-teal-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">邀约 ID:</span>
                  <span className="text-gray-800 font-mono font-bold">{periodsToShow.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">计划名称:</span>
                  <span className="text-gray-800 font-bold text-right max-w-[240px] truncate" title={periodsToShow.planName}>
                    {periodsToShow.planName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">响应日期:</span>
                  <span className="text-gray-800 font-mono font-bold">{periodsToShow.date}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-gray-700 block">所有响应时段 ({periodsToShow.periods.length} 个)</span>
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {periodsToShow.periods.map((p, i) => (
                    <div 
                      key={i} 
                      className="bg-teal-50/50 border border-teal-100/60 hover:border-teal-300 rounded-lg py-2 px-3 font-mono text-center text-xs font-bold text-teal-950 flex items-center justify-center space-x-1.5 transition"
                    >
                      <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button 
                onClick={() => setPeriodsToShow(null)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-sm transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
