/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Info, Calendar, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { StrategyGroup, StrategyItem, Site } from "../types";

interface StrategyScheduleProps {
  selectedSite: Site;
  strategyGroups: StrategyGroup[];
}

export default function StrategySchedule({ selectedSite, strategyGroups }: StrategyScheduleProps) {
  // Calendar focuses on June 2026 (the screenshot is 2026-06)
  const daysInJune = 30;
  const startDayOffset = 0; // June 1, 2026 is a Monday (0 offset for index 0 to 6)

  // Current selected day for preview
  const [selectedDay, setSelectedDay] = useState(8); // Default to today (June 8)

  // Get active plans for a specific calendar day in June 2026
  const getStrategyGroupsForDay = (day: number) => {
    const dateStr = `2026-06-${day.toString().padStart(2, "0")}`;
    
    // Prioritize temporary strategy if exists, but also list regular strategy
    const matches = strategyGroups.filter((sg) => {
      // Handle standard ranges
      if (sg.dateActive === dateStr) return true;
      if (sg.name.includes("06/01-06/03") && day >= 1 && day <= 3) return true;
      if (sg.name.includes("06/05-06/07") && day >= 5 && day <= 7) return true;
      if (sg.name.includes("06/08-06/10") && day >= 8 && day <= 10 && !sg.isTemporary) return true;
      return false;
    });

    return matches;
  };

  // Currently focused group tab in right side sidebar
  const activeDayGroups = getStrategyGroupsForDay(selectedDay);
  const [activeGroupTabId, setActiveGroupTabId] = useState<string | null>(null);

  // If selected day's groups change, reset the tab selection
  React.useEffect(() => {
    if (activeDayGroups.length > 0) {
      // Prefer temporary compiled vpp plans if possible
      const tempGroup = activeDayGroups.find(g => g.isTemporary);
      setActiveGroupTabId(tempGroup ? tempGroup.id : activeDayGroups[0].id);
    } else {
      setActiveGroupTabId(null);
    }
  }, [selectedDay, strategyGroups]);

  const activeReviewGroup = strategyGroups.find(g => g.id === activeGroupTabId);

  return (
    <div className="flex-grow p-6 bg-gray-50 flex flex-col space-y-6 select-none overflow-y-auto font-sans" id="strategy-run-workspace">
      
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">EMS 策略运行排期管理</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            查看和维护微网站点在未来日期的复合排班计划。系统支持最高级别的临时需求响应覆盖及 EMS 自动调度切换。
          </p>
        </div>
        <div className="bg-white border border-gray-200.rounded-lg px-3 py-1 flex items-center space-x-1.5 text-xs text-gray-600 shadow-xs">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>正在查看宿主站点: <strong>{selectedSite.name}</strong></span>
        </div>
      </div>

      {/* Main Grid: Left Calendar / Right Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        
        {/* Left Side: Calendar (Col span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          
          {/* Calendar Controller Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-800 text-sm">策略排班日历表</span>
              <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                2026-06 生效中
              </span>
            </div>

            <div className="flex items-center space-x-1 font-mono text-gray-500">
              <button className="p-1 rounded hover:bg-gray-200 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-gray-800 text-sm">2026年06月</span>
              <button className="p-1 rounded hover:bg-gray-200 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => alert("本期需求限制：VPP邀约同意后自动完成策略排班插入，无需管理员手工新增。")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1 rounded text-[11px] shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-3.0 h-3.0" />
              <span>批量操作</span>
            </button>
          </div>

          {/* Calendar Headers: Mon to Sun */}
          <div className="grid grid-cols-7 border-b border-gray-100 text-center py-2 text-[11px] font-bold text-gray-500 bg-gray-50/50 uppercase">
            <div>周一</div>
            <div>周二</div>
            <div>周三</div>
            <div>周四</div>
            <div>周五</div>
            <div>周六</div>
            <div>周日</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 flex-grow divide-x divide-y divide-gray-100 border-r border-b border-gray-100">
            {/* Empty days offsets */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="bg-gray-50/20 py-10" />
            ))}

            {/* Real Days of June 2026 */}
            {Array.from({ length: daysInJune }).map((_, idx) => {
              const dayNum = idx + 1;
              const isToday = dayNum === 8; // mock date: june 8, 2026
              const isSelected = selectedDay === dayNum;
              const groupsForDay = getStrategyGroupsForDay(dayNum);

              // check if contains temporary strategy
              const hasTemporary = groupsForDay.some((g) => g.isTemporary);
              const activeGroup = groupsForDay.find((g) => hasTemporary ? g.isTemporary : !g.isTemporary);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`min-h-[75px] p-2 space-y-1.5 cursor-pointer relative hover:bg-teal-50/20 transition flex flex-col ${
                    isSelected ? "bg-teal-50/30 ring-1 ring-inset ring-teal-500" : "bg-white"
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full font-mono font-bold ${
                      isToday 
                        ? "bg-teal-500 text-white shadow-xs" 
                        : isSelected
                        ? "text-teal-700 font-extrabold"
                        : "text-gray-500"
                    }`}>
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </span>
                    {hasTemporary && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" title="存在需求响应临时计划" />
                    )}
                  </div>

                  {/* Active Strategy rendering */}
                  <div className="flex-1 flex flex-col justify-end space-y-1">
                    {groupsForDay.map((sg) => (
                      <div
                        key={sg.id}
                        className={`text-[9px] px-1.5 py-1 rounded text-left overflow-hidden truncate transition ${
                          sg.isTemporary
                            ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold shadow-xs"
                            : "bg-teal-50 text-teal-700 border-l-2 border-teal-500"
                        }`}
                        title={sg.name}
                      >
                        {sg.isTemporary ? `临时_${sg.name.split("_")[1] || "编排"}` : sg.name.split(" ")[0]}
                      </div>
                    ))}
                    {groupsForDay.length === 0 && (
                      <span className="text-[9px] text-gray-300 italic pt-2">无部署计划</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Strategy parameters panel (Col span 1) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col space-y-4 font-sans text-xs">
          
          <div className="border-b border-gray-100 pb-3">
            <span className="text-gray-400 uppercase text-[10px] font-bold">策略运行监测及参数预览</span>
            <div className="flex justify-between items-center mt-1">
              <h3 className="text-sm font-extrabold text-gray-800">2026年06月{selectedDay < 10 ? `0${selectedDay}` : selectedDay}日</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-gray-100 text-gray-500 font-mono">
                Site: {selectedSite.name}
              </span>
            </div>
          </div>

          {activeDayGroups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Calendar className="w-8 h-8 text-gray-300 mb-2" />
              <span>该日期没有配置任何出线或储能约束策略。EMS将运行在原始全额自消纳模式下。</span>
            </div>
          ) : (
            <>
              {/* Tabs for Multiple active schemes on that day */}
              <div className="flex space-x-1.5 border-b border-gray-50 pb-2">
                {activeDayGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroupTabId(group.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                      activeGroupTabId === group.id
                        ? "bg-teal-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {group.isTemporary ? "临时策略副本" : "基准组合模式"}
                  </button>
                ))}
              </div>

              {activeReviewGroup && (
                <div className="flex-1 flex flex-col space-y-3.5">
                  <div className="flex items-center justify-between bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/50">
                    <div>
                      <span className="text-gray-500 block text-[9px]">生效策略版本</span>
                      <strong className="text-teal-900 font-bold text-xs">{activeReviewGroup.name}</strong>
                    </div>
                    <span className="flex items-center space-x-1 text-teal-600 font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                      <span>已生效</span>
                    </span>
                  </div>

                  {/* Strategy list */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    <span className="font-bold text-gray-700 block">时段调度规则链 ({activeReviewGroup.strategies.length}个时段)</span>
                    
                    <div className="space-y-3">
                      {activeReviewGroup.strategies.map((strategy) => (
                        <div 
                          key={strategy.id} 
                          className={`p-3 rounded-lg border transition ${
                            strategy.isTemporary 
                              ? "bg-amber-50/50 border-amber-200" 
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
                            <span className="font-bold text-gray-800 flex items-center space-x-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${strategy.isTemporary ? "bg-amber-500" : "bg-teal-600"}`} />
                              <span>{strategy.name}</span>
                            </span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-600 text-[9px]">
                              {strategy.timeslot}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-1.5 text-[10px] text-gray-600">
                            <div>策略模型: <strong className="text-gray-800">{strategy.type}</strong></div>
                            <div>优先权级: <strong className="text-indigo-800 font-mono font-bold">Lvl {strategy.priority}</strong></div>
                            
                            {strategy.chargeReserve !== undefined && (
                              <div>充电预留: <strong className="text-gray-800 font-mono">{strategy.chargeReserve}%</strong></div>
                            )}
                            {strategy.dischargeReserve !== undefined && (
                              <div>放电预留: <strong className="text-gray-800 font-mono">{strategy.dischargeReserve}%</strong></div>
                            )}
                            {strategy.backflowThreshold !== undefined && (
                              <div className="col-span-2">逆流功率红线: <strong className="text-teal-700 font-mono font-bold">{strategy.backflowThreshold} kW</strong></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Preview Visual bar */}
                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400 font-bold block mb-2">24H 策略切换预览时序</span>
                    <div className="w-full h-5 rounded-lg overflow-hidden flex font-sans text-[9px] text-white">
                      {activeReviewGroup.strategies.map((str, idx) => {
                        // calculate width based on approximate duration
                        let flexVal = 1;
                        if (str.timeslot.startsWith("00:00-08:00")) flexVal = 8;
                        else if (str.timeslot.startsWith("08:00-14:00")) flexVal = 6;
                        else if (str.timeslot.startsWith("14:00-16:00")) flexVal = 2;
                        else if (str.timeslot.startsWith("16:00-24:00")) flexVal = 8;
                        else if (str.timeslot.startsWith("08:00-24:00")) flexVal = 16;
                        
                        return (
                          <div
                            key={str.id}
                            style={{ flex: flexVal }}
                            className={`h-full flex items-center justify-center font-bold px-1 select-none overflow-hidden text-center truncate ${
                              str.isTemporary
                                ? "bg-amber-500 border-r border-[#ffffff33]"
                                : idx % 2 === 0
                                ? "bg-teal-600 border-r border-[#ffffff33]"
                                : "bg-teal-800"
                            }`}
                            title={`${str.name}: ${str.timeslot}`}
                          >
                            {str.timeslot.split("-")[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
