/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum VppStatus {
  PENDING_CONFIRM = "待确认",
  CONFIRMING = "确认中",
  AGREED = "已同意",
  REJECTED = "已拒绝",
  EXPIRED = "已过期",
  EXECUTING = "执行中",
  COMPLETED = "已完成"
}

export enum DrPlanType {
  MANUAL = "手动创建",
  VPP = "VPP自动创建"
}

export interface Site {
  id: string;
  name: string;
  meterNo: string; // 电表户号
  capacity: number; // 站点规模 (kW)
  currentLoad: number; // 当前负荷 (kW)
  storageSoc: number; // 储能储电率 (%)
  address: string;
  status: "运行中" | "离线" | "异常";
  currentActiveStrategy: string; // 当前应用策略组合
}

export interface VppInvitation {
  id: string;
  source: string; // 虚拟电电厂来源
  planName: string;
  responseDate: string; // YYYY-MM-DD
  responsePeriod: string; // HH:mm-HH:mm
  targetCapacity: number; // 目标响应容量 (kW)
  subsidyPrice: number; // 补贴单价 (元/kWh)
  refRevenue: number; // 预估/参考收益 (元)
  expiryTime: string; // 截止确认时间
  status: VppStatus;
  actualCapacity?: number; // 实际响应容量 (kW)
  efficiency?: number; // 响应效率 (%)
  settlementRevenue?: number; // 结算收益 (元)
  remark?: string;
  createTime: string;
  declaredCapacity?: number; // 用户申报可参与容量 (kW)
  declaredPrice?: number; // 用户申报报价 (元/kWh)
  intervalDeclarations?: { timeslot: string; capacity: number; price: number; }[];
}

export interface DrPlan {
  id: string;
  name: string; // 计划名称
  type: DrPlanType; // 创建方式
  responseDate: string; // 响应日期
  responsePeriod: string; // 响应时段
  targetCapacity: number; // 目标响应容量 (kW)
  baselineAvgLoad: number; // 基线平均负荷 (kW)
  baselineMaxLoad: number; // 基线最大负荷 (kW)
  actualCapacity?: number; // 实际响应容量 (kW)
  avgLoad?: number; // 响应平均负荷 (kW)
  maxLoad?: number; // 响应最大负荷 (kW)
  efficiency?: number; // 响应效率 (%)
  profit?: number; // 参考收益 (元)
  status: "待执行" | "执行中" | "已完成";
  vppInvitationId?: string; // 关联的邀约ID
  meterNo?: string; // 电表户号
}

export interface StrategyItem {
  id: string;
  name: string; // e.g. 动态增容, 削峰填谷
  type: string; // 策略类型: 需求响应, 充电预留, 放电预留, 等
  timeslot: string; // 如 "00:00-14:00"
  chargeReserve?: number; // 充电预留容量 (%)
  dischargeReserve?: number; // 放电预留容量 (%)
  backflowThreshold?: number; // 可逆流阈值 (kW)
  allowDischargeShift?: number; // 允许充电/放电平移量 (kW)
  isTemporary?: boolean; // 是否是临时策略
  priority: number; // 优先级
}

export interface StrategyGroup {
  id: string;
  name: string; // 策略组合名称
  status: "待生效" | "曾生效" | "曾执行" | "已生效" | "执行中" | "已失效";
  strategies: StrategyItem[];
  dateActive: string; // 适用日期 (YYYY-MM-DD)
  isTemporary?: boolean; // 是否是VPP临时编排创建
}

export interface SystemNotification {
  id: string;
  title: string;
  type: "invitation_new" | "invitation_expiry" | "strategy_created" | "strategy_exec_start" | "strategy_exec_end" | "exec_exception";
  content: string;
  timestamp: string;
  isRead: boolean;
  linkToTab?: string; // 引导链接
  metadata?: any;
}
