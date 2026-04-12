import { LeaveRequest } from "@/types";

export interface DecisionContext {
  teamSize: number;
  overlappingLeaves: LeaveRequest[];
  userRecentLeaves: LeaveRequest[];
  departmentLimit: number;
}

export type RiskLevel = 'Safe' | 'Medium' | 'High Risk';

export interface DecisionResult {
  riskLevel: RiskLevel;
  overlapCount: number;
  capacityImpact: number; // 0-100
  fairnessAlert?: string;
}

/**
 * Evaluates a leave request against team context to provide decision support.
 */
export function evaluateRequest(
  request: Partial<LeaveRequest>,
  context: DecisionContext
): DecisionResult {
  const { teamSize, overlappingLeaves, departmentLimit } = context;
  
  const overlapCount = overlappingLeaves.length;
  const activeLeavesAfterApproval = overlapCount + 1;
  const capacityImpact = teamSize > 0 
    ? Math.round(((teamSize - activeLeavesAfterApproval) / teamSize) * 100)
    : 100;

  let riskLevel: RiskLevel = 'Safe';
  
  if (overlapCount >= departmentLimit) {
    riskLevel = 'High Risk';
  } else if (overlapCount >= departmentLimit - 1) {
    riskLevel = 'Medium';
  }

  // Fairness Analysis: Check if user has had many leaves recently (e.g., > 10 days in last 30 days)
  let fairnessAlert: string | undefined;
  const totalRecentDays = context.userRecentLeaves.reduce((sum, r) => sum + (r.days || 0), 0);
  if (totalRecentDays > 10) {
    fairnessAlert = `Employee has taken ${totalRecentDays} days of leave in the last 30 days.`;
  }

  return {
    riskLevel,
    overlapCount,
    capacityImpact,
    fairnessAlert
  };
}

/**
 * Calculates leave density for a given day.
 */
export function calculateLeaveDensity(onLeaveCount: number, teamSize: number): number {
  if (teamSize === 0) return 0;
  return (onLeaveCount / teamSize) * 100;
}

/**
 * Filters requests that overlap with a specific date range.
 */
export function getOverlappingRequests(
  range: { start: Date; end: Date },
  allRequests: LeaveRequest[]
): LeaveRequest[] {
  return allRequests.filter(req => {
    const reqStart = new Date(req.start_date);
    const reqEnd = new Date(req.end_date);
    return (
      (reqStart <= range.end && reqEnd >= range.start) &&
      req.status === 'approved'
    );
  });
}
