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
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type {
  ClassItem,
  Enrollment,
  Notice,
  Preferences,
  Profile,
  RequestItem,
} from '../types';

function currentUid() {
  if (!auth.currentUser) {
    throw Error('Please sign in.');
  }

  return auth.currentUser.uid;
}

export function watch<T>(
  name: string,
  filters: [string, string][],
  onData: (items: T[]) => void,
  onError: (message: string) => void
) {
  const request = query(
    collection(db, name),
    ...filters.map(([field, value]) =>
      where(field, '==', value)
    )
  );

  return onSnapshot(
    request,
    snapshot => {
      const items = snapshot.docs.map(
        item =>
          ({
            id: item.id,
            ...item.data(),
          }) as T
      );

      onData(items);
    },
    error => onError(error.message)
  );
}

export function saveProfile(profile: Profile) {
  return setDoc(
    doc(db, 'users', currentUid()),
    profile
  );
}

export function savePreferences(preferences: Preferences) {
  return setDoc(
    doc(db, 'preferences', currentUid()),
    preferences
  );
}

export async function loadPreferences() {
  const snapshot = await getDoc(
    doc(db, 'preferences', currentUid())
  );

  return snapshot.exists()
    ? (snapshot.data() as Preferences)
    : null;
}

export async function loadClass(id: string) {
  const snapshot = await getDoc(
    doc(db, 'classes', id)
  );

  if (!snapshot.exists()) {
    throw Error('Class not found.');
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as ClassItem;
}

export async function enrolledClasses() {
  const snapshot = await getDocs(
    query(
      collection(db, 'enrollments'),
      where('studentId', '==', currentUid())
    )
  );

  return Promise.all(
    snapshot.docs.map(item =>
      loadClass(item.data().classId)
    )
  );
}

export async function saveClass(
  item: Omit<ClassItem, 'id' | 'enrolledCount'>,
  id?: string
) {
  if (id) {
    const { teacherId, teacherName, ...changes } = item;

    await updateDoc(
      doc(db, 'classes', id),
      changes
    );
  } else {
    await addDoc(
      collection(db, 'classes'),
      {
        ...item,
        enrolledCount: 0,
      }
    );
  }
}

export async function requestClass(
  item: ClassItem,
  kind: RequestItem['kind'],
  profile: Profile,
  needs: string
) {
  const studentId = currentUid();
  const requestId = `${item.id}_${studentId}_${kind}`;

  await runTransaction(db, async transaction => {
    const classRef = doc(db, 'classes', item.id);
    const requestRef = doc(db, 'requests', requestId);
    const enrollmentRef = doc(
      db,
      'enrollments',
      `${item.id}_${studentId}`
    );

    const [classSnapshot, previous, enrollment] =
      await Promise.all([
        transaction.get(classRef),
        transaction.get(requestRef),
        transaction.get(enrollmentRef),
      ]);

    if (
      !classSnapshot.exists() ||
      !classSnapshot.data().active
    ) {
      throw Error('Class is closed.');
    }

    if (previous.exists()) {
      throw Error(
        'You already sent this request. Check My activity.'
      );
    }

    if (enrollment.exists()) {
      throw Error('You are already enrolled.');
    }

    const currentClass = classSnapshot.data();

    if (
      kind !== 'waitlist' &&
      currentClass.enrolledCount >= currentClass.capacity
    ) {
      throw Error('Class is full. Join the waitlist.');
    }

    transaction.set(requestRef, {
      studentId,
      studentName: profile.name,
      teacherId: item.teacherId,
      classId: item.id,
      classTitle: item.title,
      kind,
      status: 'pending',
      needs,
      sessionDate: kind === 'trial' ? item.trialDate : '',
      createdAt: serverTimestamp(),
    });
  });
}

export async function reviewRequest(
  item: RequestItem,
  approve: boolean
) {
  const teacherId = currentUid();

  await runTransaction(db, async transaction => {
    const requestRef = doc(db, 'requests', item.id);
    const classRef = doc(db, 'classes', item.classId);
    const enrollmentRef = doc(
      db,
      'enrollments',
      `${item.classId}_${item.studentId}`
    );

    const [requestSnapshot, classSnapshot, enrollment] =
      await Promise.all([
        transaction.get(requestRef),
        transaction.get(classRef),
        transaction.get(enrollmentRef),
      ]);

    if (
      !requestSnapshot.exists() ||
      !classSnapshot.exists() ||
      requestSnapshot.data().teacherId !== teacherId ||
      requestSnapshot.data().status !== 'pending'
    ) {
      throw Error('This request cannot be reviewed.');
    }

    if (item.kind === 'waitlist' && approve) {
      throw Error(
        'Waitlist entries are informational. Contact the student when a place opens.'
      );
    }

    if (approve && item.kind === 'enrollment') {
      if (enrollment.exists()) {
        throw Error('Student already enrolled.');
      }

      const currentClass = classSnapshot.data();

      if (
        !currentClass.active ||
        currentClass.enrolledCount >= currentClass.capacity
      ) {
        throw Error('No seats available.');
      }

      transaction.set(enrollmentRef, {
        studentId: item.studentId,
        studentName: item.studentName,
        classId: item.classId,
        teacherId,
        classTitle: item.classTitle,
        joinedAt: serverTimestamp(),
      });

      transaction.update(classRef, {
        enrolledCount: currentClass.enrolledCount + 1,
        lastEnrollmentId: enrollmentRef.id,
      });
    }

    const status = approve ? 'approved' : 'declined';

    transaction.update(requestRef, {
      status,
      reviewedAt: serverTimestamp(),
    });

    transaction.set(
      doc(db, 'notifications', item.id),
      {
        userId: item.studentId,
        teacherId,
        classId: item.classId,
        requestId: item.id,
        message:
          `${item.classTitle}: ${item.kind} request ${status}.`,
        read: false,
        createdAt: serverTimestamp(),
      }
    );
  });
}

export function markRead(id: string) {
  return updateDoc(
    doc(db, 'notifications', id),
    { read: true }
  );
}

export type {
  ClassItem,
  Enrollment,
  Notice,
  Preferences,
  Profile,
  RequestItem,
};