export type Role = "student" | "teacher";

export type Profile = {
  name: string;
  phone: string;
  grade: number;
  role: Role;
};

export type Preferences = {
  subject: string;
  medium: string;
  budget: number;
  latitude: number;
  longitude: number;
  radiusKm: number;
  day: number;
  start: number;
  end: number;
  needs: string;
};

export type ClassItem = {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  subject: string;
  grade: number;
  medium: string;
  fee: number;
  mode: "online" | "in-person";
  location: string;
  latitude: number;
  longitude: number;
  day: number;
  start: number;
  end: number;
  capacity: number;
  enrolledCount: number;
  trialDate: string;
  active: boolean;
  deleted?: true;
};

export type RequestItem = {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  classId: string;
  classTitle: string;
  kind: "trial" | "enrollment" | "waitlist";
  status: "pending" | "approved" | "declined";
  needs: string;
  sessionDate: string;
};

export type Enrollment = {
  id: string;
  classId: string;
  studentId: string;
  teacherId: string;
  studentName: string;
  classTitle: string;
};

export type Notice = {
  classId?: string;
  id: string;
  userId: string;
  message: string;
  read: boolean;
};