import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import type {
  ClassItem,
  Enrollment,
  Notice,
  Preferences,
  Profile,
  RequestItem,
} from "../types";

function uid() {
  if (!auth.currentUser) throw new Error("Please sign in.");
  return auth.currentUser.uid;
}

export function watch<T>(
  name: string,
  filters: [string, string][],
  ok: (items: T[]) => void,
  fail: (message: string) => void,
) {
  const collectionQuery = query(
    collection(db, name),
    ...filters.map(([field, value]) => where(field, "==", value)),
  );

  return onSnapshot(
    collectionQuery,
    (snapshot) => {
      ok(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T));
    },
    (error) => fail(error.message),
  );
}

export const saveProfile = (profile: Profile) =>
  setDoc(doc(db, "users", uid()), profile);

export const savePreferences = (preferences: Preferences) =>
  setDoc(doc(db, "preferences", uid()), preferences);

export async function loadPreferences() {
  const snapshot = await getDoc(doc(db, "preferences", uid()));
  return snapshot.exists() ? (snapshot.data() as Preferences) : null;
}

export async function loadClass(id: string) {
  const snapshot = await getDoc(doc(db, "classes", id));

  if (!snapshot.exists()) throw new Error("Class not found.");

  return { id: snapshot.id, ...snapshot.data() } as ClassItem;
}

export async function enrolledClasses() {
  const snapshot = await getDocs(
    query(collection(db, "enrollments"), where("studentId", "==", uid())),
  );

  const classes = await Promise.all(
    snapshot.docs.map((enrollment) => loadClass(enrollment.data().classId)),
  );

  return classes.filter((item) => !item.deleted);
}

export async function saveClass(
  item: Omit<ClassItem, "id" | "enrolledCount" | "deleted">,
  id?: string,
) {
  if (id) {
    const { teacherId, teacherName, ...changes } = item;
    await updateDoc(doc(db, "classes", id), changes);
  } else {
    await addDoc(collection(db, "classes"), { ...item, enrolledCount: 0 });
  }
}

export const deleteClass = (id: string) =>
  updateDoc(doc(db, "classes", id), { active: false, deleted: true });

export async function removeEnrollment(id: string) {
  const teacherId = uid();

  await runTransaction(db, async (transaction) => {
    const enrollmentRef = doc(db, "enrollments", id);
    const enrollmentSnapshot = await transaction.get(enrollmentRef);

    if (!enrollmentSnapshot.exists()) return;

    const enrollment = enrollmentSnapshot.data();
    const classRef = doc(db, "classes", enrollment.classId);
    const classSnapshot = await transaction.get(classRef);
    const classData = classSnapshot.data();

    if (
      enrollment.teacherId !== teacherId ||
      classData?.teacherId !== teacherId
    ) {
      throw new Error("Only the class owner can remove this enrollment.");
    }

    const count = classData.enrolledCount;

    if (!Number.isInteger(count) || count < 1) {
      throw new Error("The class enrollment count is invalid.");
    }

    transaction.update(classRef, {
      enrolledCount: count - 1,
      lastRemovalId: id,
    });
    transaction.delete(enrollmentRef);
  });
}

export async function requestClass(
  item: ClassItem,
  kind: RequestItem["kind"],
  profile: Profile,
  needs: string,
) {
  const studentId = uid();
  const requestId = `${item.id}_${studentId}_${kind}`;

  await runTransaction(db, async (transaction) => {
    const classRef = doc(db, "classes", item.id);
    const requestRef = doc(db, "requests", requestId);
    const enrollmentRef = doc(db, "enrollments", `${item.id}_${studentId}`);

    const [liveClass, priorRequest, enrollment] = await Promise.all([
      transaction.get(classRef),
      transaction.get(requestRef),
      transaction.get(enrollmentRef),
    ]);

    if (!liveClass.exists() || !liveClass.data().active) {
      throw new Error("Class is closed.");
    }
    if (priorRequest.exists()) {
      throw new Error("You already sent this request. Check My activity.");
    }
    if (enrollment.exists()) {
      throw new Error("You are already enrolled.");
    }

    const { enrolledCount, capacity } = liveClass.data();

    if (kind !== "waitlist" && enrolledCount >= capacity) {
      throw new Error("Class is full. Join the waitlist.");
    }

    transaction.set(requestRef, {
      studentId,
      studentName: profile.name,
      teacherId: item.teacherId,
      classId: item.id,
      classTitle: item.title,
      kind,
      status: "pending",
      needs,
      sessionDate: kind === "trial" ? item.trialDate : "",
      createdAt: serverTimestamp(),
    });
  });
}

export async function reviewRequest(request: RequestItem, approve: boolean) {
  const teacherId = uid();

  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, "requests", request.id);
    const classRef = doc(db, "classes", request.classId);
    const enrollmentRef = doc(
      db,
      "enrollments",
      `${request.classId}_${request.studentId}`,
    );

    const [liveRequest, liveClass, enrollment] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(classRef),
      transaction.get(enrollmentRef),
    ]);

    if (
      !liveRequest.exists() ||
      !liveClass.exists() ||
      liveRequest.data().teacherId !== teacherId ||
      liveRequest.data().status !== "pending"
    ) {
      throw new Error("This request cannot be reviewed.");
    }

    const classData = liveClass.data();

    if (approve && classData.deleted) {
      throw new Error("This class was deleted.");
    }

    if (approve && request.kind === "waitlist") {
      throw new Error(
        "Waitlist entries are informational. Contact the student when a place opens.",
      );
    }

    if (approve && request.kind === "enrollment") {
      if (enrollment.exists()) throw new Error("Student already enrolled.");

      const { active, enrolledCount, capacity } = classData;

      if (!active || enrolledCount >= capacity) {
        throw new Error("No seats available.");
      }

      transaction.set(enrollmentRef, {
        studentId: request.studentId,
        studentName: request.studentName,
        classId: request.classId,
        teacherId,
        classTitle: request.classTitle,
        joinedAt: serverTimestamp(),
      });

      transaction.update(classRef, {
        enrolledCount: enrolledCount + 1,
        lastEnrollmentId: enrollmentRef.id,
      });
    }

    const status = approve ? "approved" : "declined";

    transaction.update(requestRef, {
      status,
      reviewedAt: serverTimestamp(),
    });

    transaction.set(doc(db, "notifications", request.id), {
      userId: request.studentId,
      teacherId,
      classId: request.classId,
      requestId: request.id,
      message: `${request.classTitle}: ${request.kind} request ${status}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  });
}

export const markRead = (id: string) =>
  updateDoc(doc(db, "notifications", id), { read: true });

export type {
  ClassItem,
  Enrollment,
  Notice,
  Preferences,
  Profile,
  RequestItem,
};