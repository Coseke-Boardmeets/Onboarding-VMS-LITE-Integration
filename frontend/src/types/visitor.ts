// Shared TypeScript types — match the API contract exactly.
// Import from here in all your components. Do NOT redefine these elsewhere.

export type VisitorStatus = "PENDING" | "CHECKED_IN" | "CHECKED_OUT";

export interface Visitor {
  id: string;
  fullName: string;
  purpose: string;
  status: VisitorStatus;
}

export interface CreateVisitorPayload {
  fullName: string;
  purpose: string;
}
