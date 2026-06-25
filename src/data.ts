/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Site, VppInvitation, DrPlan, StrategyGroup, SystemNotification, VppStatus, DrPlanType } from "./types";

// Initial sites list
export const initialSites: Site[] = [
  {
    id: "site_01",
    name: "双黄蛋 🌾",
    meterNo: "9510048231", // 电表户号
    capacity: 500,
    currentLoad: 215.4,
    storageSoc: 45,
    address: "江苏省常州市新北区双黄太阳能农场1号",
    status: "运行中",
    currentActiveStrategy: "策略组合01"
  },
  {
    id: "site_02",
    name: "红星生产二站 🏭",
    meterNo: "", // 故意为空，以测试“未维护电表户号时无法同意邀约”的校验机制!
    capacity: 1200,
    currentLoad: 780.2,
    storageSoc: 82,
    address: "江苏省扬州市广陵区红星工业园B区",
    status: "运行中",
    currentActiveStrategy: "未应用策略"
  },
  {
    id: "site_03",
    name: "天合试验基地 🔋",
    meterNo: "8820047392",
    capacity: 800,
    currentLoad: 120.5,
    storageSoc: 91,
    address: "江苏省常州市天合富家零碳试验基地首层",
    status: "运行中",
    currentActiveStrategy: "夏季调峰策略组"
  }
];

// Initial VPP invitations list mapping Section 1.1 of PRD
export const initialVppInvitations: VppInvitation[] = [
  {
    id: "VPP-2026-003",
    source: "南方电网 VPP",
    planName: "南方电网 VPP_2026-06-09_14:00-16:00",
    responseDate: "2026-06-09",
    responsePeriod: "14:00-16:00",
    targetCapacity: 50.00,
    subsidyPrice: 1.50,
    refRevenue: 150.00, // 50kW * 1.5元 * 2小时
    expiryTime: "2026-06-08 22:00",
    status: VppStatus.PENDING_CONFIRM,
    remark: "迎峰度夏高等级削峰调峰响应邀约，请按需求执行。",
    createTime: "2026-06-08 10:00"
  },
  {
    id: "VPP-2026-004",
    source: "华东电力调峰 VPP",
    planName: "华东电力调峰 VPP_2026-06-12_09:00-11:30",
    responseDate: "2026-06-12",
    responsePeriod: "09:00-11:30",
    targetCapacity: 100.00,
    subsidyPrice: 1.80,
    refRevenue: 450.00, // 100kW * 1.8元 * 2.5小时
    expiryTime: "2026-06-11 18:00",
    status: VppStatus.PENDING_CONFIRM,
    remark: "夏季高峰网荷协同负荷控制响应邀约。",
    createTime: "2026-06-08 11:30"
  },
  {
    id: "VPP-2026-001",
    source: "南方电网 VPP",
    planName: "南方电网 VPP_2025-02-27_00:40-23:01",
    responseDate: "2025-02-27",
    responsePeriod: "00:40-23:01",
    targetCapacity: 25.00,
    subsidyPrice: 1.20,
    refRevenue: 670.50,
    expiryTime: "2025-02-26 12:00",
    status: VppStatus.COMPLETED,
    actualCapacity: 22.50,
    efficiency: 90.00,
    settlementRevenue: 603.45,
    remark: "历史削峰邀约数据",
    createTime: "2025-02-25 08:00"
  },
  {
    id: "VPP-2026-002",
    source: "华东电力调峰 VPP",
    planName: "华东电力调峰 VPP_2026-06-04_14:00-16:00",
    responseDate: "2026-06-04",
    responsePeriod: "14:00-16:00",
    targetCapacity: 40.00,
    subsidyPrice: 1.60,
    refRevenue: 128.00,
    expiryTime: "2026-06-03 12:00",
    status: VppStatus.COMPLETED,
    actualCapacity: 42.00,
    efficiency: 105.00,
    settlementRevenue: 134.40,
    remark: "上期已同意的VPP邀约，现已顺利执行并核算完毕。",
    createTime: "2026-06-02 09:00"
  },
  {
    id: "VPP-2026-099",
    source: "国网湖北电力 VPP",
    planName: "国网湖北电力 VPP_2026-06-07_15:00-17:00",
    responseDate: "2026-06-07",
    responsePeriod: "15:00-17:00",
    targetCapacity: 60.00,
    subsidyPrice: 1.40,
    refRevenue: 168.00,
    expiryTime: "2026-06-06 18:00",
    status: VppStatus.EXPIRED,
    remark: "超时未确认，系统自动过期处理",
    createTime: "2026-06-05 14:00"
  }
];

// Initial demand response plans (matching first screenshot and section 1.5 of PRD)
export const initialDrPlans: DrPlan[] = [
  {
    id: "plan_01",
    name: "测试名称长度01",
    type: DrPlanType.MANUAL,
    responseDate: "2025-02-27",
    responsePeriod: "00:40-23:01",
    targetCapacity: 25.00,
    baselineAvgLoad: 222.00,
    baselineMaxLoad: 345.00,
    actualCapacity: undefined,
    avgLoad: undefined,
    maxLoad: undefined,
    efficiency: undefined,
    profit: undefined,
    status: "已完成"
  },
  {
    id: "plan_02",
    name: "华东电力调峰 VPP_2026-06-04_14:00-16:00",
    type: DrPlanType.VPP,
    responseDate: "2026-06-04",
    responsePeriod: "14:00-16:00",
    targetCapacity: 40.00,
    baselineAvgLoad: 280.00,
    baselineMaxLoad: 390.00,
    actualCapacity: 42.00,
    avgLoad: 238.00,
    maxLoad: 270.00,
    efficiency: 105.00,
    profit: 134.40,
    status: "已完成",
    vppInvitationId: "VPP-2026-002",
    meterNo: "9510048231"
  },
  {
    id: "plan_03",
    name: "迎峰度夏自主削峰响应计划01",
    type: DrPlanType.MANUAL,
    responseDate: "2026-06-15",
    responsePeriod: "13:00-15:00",
    targetCapacity: 80.00,
    baselineAvgLoad: 310.00,
    baselineMaxLoad: 420.00,
    status: "待执行"
  }
];

// Initial system notifications (Section 1.4 of PRD)
export const initialNotifications: SystemNotification[] = [
  {
    id: "notif_01",
    title: "收到新的需求响应调度邀约",
    type: "invitation_new",
    content: "收到 [南方电网 VPP] 临时调度邀约，响应日期为 2026-06-09 14:00-16:00，目标响应容量 50.00 kW，预估参考收益 150.00 元，请及时确认。",
    timestamp: "2026-06-08 10:00",
    isRead: false,
    linkToTab: "vpp"
  },
  {
    id: "notif_02",
    title: "策略任务即将开始执行",
    type: "strategy_exec_start",
    content: "需求响应策略 (华东电力调峰 VPP_2026-06-04_14:00-16:00) 自动编排下发已生效，将在6月4日 14:00 前自动开启并覆盖原策略，时段分割已完成。",
    timestamp: "2026-06-04 13:00",
    isRead: true
  }
];

// Standard strategies (Screenshot 3 & PRD Section 1.2 "时段分割")
export const initialStrategyGroups: StrategyGroup[] = [
  {
    id: "sg_01",
    name: "策略组合01 连续策略(06/01-06/03)",
    status: "曾生效",
    dateActive: "2026-06-01",
    strategies: [
      { id: "st_1", name: "时段1", type: "削峰填谷", timeslot: "00:00-08:00", priority: 1, chargeReserve: 10, dischargeReserve: 3 },
      { id: "st_2", name: "时段2", type: "动态增容", timeslot: "08:00-24:00", priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 }
    ]
  },
  {
    id: "sg_01_split",
    name: "临时_0604 策略组合01",
    status: "曾执行",
    dateActive: "2026-06-04",
    isTemporary: true,
    strategies: [
      { id: "st_1_split1", name: "时段1", type: "削峰填谷", timeslot: "00:00-08:00", priority: 1, chargeReserve: 10, dischargeReserve: 3 },
      { id: "st_2_split1", name: "时段2 (分割前)", type: "动态增容", timeslot: "08:00-14:00", priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 },
      { id: "st_vpp", name: "VPP需求响应(约定)", type: "需求响应", timeslot: "14:00-16:00", priority: 100, isTemporary: true }, // 最高优先级
      { id: "st_2_split2", name: "时段2 (分割后)", type: "动态增容", timeslot: "16:00-24:00", priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 }
    ]
  },
  {
    id: "sg_05",
    name: "策略组合01 连续策略(06/05-06/07)",
    status: "曾生效",
    dateActive: "2026-06-05",
    strategies: [
      { id: "st_1", name: "时段1", type: "削峰填谷", timeslot: "00:00-08:00", priority: 1, chargeReserve: 10, dischargeReserve: 3 },
      { id: "st_2", name: "时段2", type: "动态增容", timeslot: "08:00-24:00", priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 }
    ]
  },
  {
    id: "sg_08",
    name: "策略组合01 连续策略(06/08-06/10)",
    status: "已生效",
    dateActive: "2026-06-08", // 今日生效 (today is June 8, 2026)
    strategies: [
      { id: "st_1", name: "时段1", type: "削峰填谷", timeslot: "00:00-08:00", priority: 1, chargeReserve: 10, dischargeReserve: 3 },
      { id: "st_2", name: "时段2", type: "动态增容", timeslot: "08:00-24:00", priority: 1, chargeReserve: 5, dischargeReserve: 10, backflowThreshold: 30 }
    ]
  }
];
