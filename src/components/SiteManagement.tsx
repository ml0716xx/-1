/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Edit, Save, AlertTriangle, CheckCircle, MapPin, Grid, Layers, RefreshCw } from "lucide-react";
import { Site } from "../types";

interface SiteManagementProps {
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>>;
  selectedSite: Site;
  setSelectedSite: (site: Site) => void;
}

export default function SiteManagement({
  sites,
  setSites,
  selectedSite,
  setSelectedSite
}: SiteManagementProps) {
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [tempMeterNo, setTempMeterNo] = useState("");
  const [tempName, setTempName] = useState("");
  const [tempCapacity, setTempCapacity] = useState("");
  const [tempAddress, setTempAddress] = useState("");

  const [notif, setNotif] = useState<string | null>(null);

  const handleStartEdit = (site: Site) => {
    setEditingSiteId(site.id);
    setTempMeterNo(site.meterNo || "");
    setTempName(site.name);
    setTempCapacity(site.capacity.toString());
    setTempAddress(site.address);
  };

  const handleSaveEdit = (id: string) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id === id) {
          const updatedSite = {
            ...site,
            name: tempName,
            meterNo: tempMeterNo.trim(),
            capacity: parseFloat(tempCapacity) || site.capacity,
            address: tempAddress
          };
          // Sync with global header selectedSite if needed
          if (selectedSite.id === id) {
            setSelectedSite(updatedSite);
          }
          return updatedSite;
        }
        return site;
      })
    );

    setEditingSiteId(null);
    setNotif("电表户号及站点基本信息已保存在本地，其将立即作为本次VPP调度的匹配基础！");
    setTimeout(() => setNotif(null), 4000);
  };

  return (
    <div className="flex-grow p-6 bg-gray-50 flex flex-col space-y-6 select-none overflow-y-auto font-sans" id="sitemgt-workspace">
      
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">微网站点档案管理</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          配置并激活站点参数。前置约束：站点参与虚拟电厂调度（VPP）前，<strong>必须</strong>维护电表户号。电表户号是电网与本系统编排的唯一关联标识。
        </p>
      </div>

      {notif && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-bold flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle className="w-5 h-5 text-teal-600 animate-bounce" />
          <span>{notif}</span>
        </div>
      )}

      {/* Guide Info Panel */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start space-x-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">电表户号校验规则（VPP接口匹配依赖）</h4>
          <p className="text-amber-800 leading-relaxed font-sans">
            1. <strong>VPP邀约推送时：</strong> 调频通信协议根据「电表户号」向目标微网站点寻路。若户号未维护或无效，电网邀约将被直接拒绝。<br />
            2. <strong>客户同意邀约时：</strong> 应届校验电表户号是否处于绑定状态。若为空白（如【红星生产二站】当前未配置电表户号），则阻断调度编排流程，直至维护完成。
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sites.map((site) => {
          const isEditing = editingSiteId === site.id;
          const isLinkedSite = selectedSite.id === site.id;

          return (
            <div
              key={site.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                isLinkedSite ? "border-teal-500 ring-1 ring-teal-500/30 shadow-md" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              {isLinkedSite && (
                <span className="absolute top-3 right-3 bg-teal-600 text-white font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider shadow-xs">
                  当前操作站
                </span>
              )}

              <div className="space-y-4">
                {/* Title */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-0.5 font-bold font-sans text-xs focus:outline-none focus:border-teal-500"
                      />
                    ) : (
                      <h3 className="font-bold text-gray-800 text-sm">{site.name}</h3>
                    )}
                    <p className="text-[10px] text-gray-400 font-mono">ID: {site.id}</p>
                  </div>
                </div>

                {/* Parameters */}
                <div className="space-y-2 border-t border-gray-50 pt-3 text-xs font-medium text-gray-600">
                  
                  {/* Meter No Input / Display */}
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex flex-col space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold block">电表户号 (电网用户编号)</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={tempMeterNo}
                          onChange={(e) => setTempMeterNo(e.target.value)}
                          placeholder="新电表户号, 如 9510048231"
                          className="border border-gray-200 bg-white rounded px-2 py-1 font-mono font-bold text-xs text-indigo-700 focus:outline-none w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`font-mono font-bold text-sm ${site.meterNo ? "text-indigo-800" : "text-rose-500 italic"}`}>
                          {site.meterNo || "未维护 (无法对接VPP)"}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          site.meterNo ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {site.meterNo ? "VPP调度已就绪" : "调度不可用"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">额定变压器容量</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempCapacity}
                        onChange={(e) => setTempCapacity(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-0.5 w-24 text-right font-mono"
                      />
                    ) : (
                      <span className="font-mono font-bold text-gray-800">{site.capacity} kW</span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-1 text-[11px] text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    {isEditing ? (
                      <textarea
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        rows={2}
                        className="border border-gray-200 rounded p-1 w-full text-[11px]"
                      />
                    ) : (
                      <span className="leading-relaxed">{site.address}</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Action feet */}
              <div className="flex items-center space-x-2 mt-5 pt-3 border-t border-gray-100">
                {isEditing ? (
                  <button
                    onClick={() => handleSaveEdit(site.id)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存站点</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(site)}
                      className="flex-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-1.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-400" />
                      <span>维护户号</span>
                    </button>
                    {!isLinkedSite && (
                      <button
                        onClick={() => setSelectedSite(site)}
                        className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold py-1.5 rounded-lg flex items-center justify-center cursor-pointer transition border border-teal-100"
                      >
                        切为操作站点
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
