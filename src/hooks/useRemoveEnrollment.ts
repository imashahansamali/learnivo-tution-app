import { useRef, useState } from "react";
import { removeEnrollment } from "../services/data";

export function useRemoveEnrollment() {
  const pending = useRef(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState("");

  async function remove(id: string) {
    if (pending.current) return;

    pending.current = true;
    setRemoving(id);
    setRemoveError("");

    try {
      await removeEnrollment(id);
    } catch (error) {
      setRemoveError(
        error instanceof Error ? error.message : "Unable to remove enrollment.",
      );
    } finally {
      pending.current = false;
      setRemoving(null);
    }
  }

  return { remove, removing, removeError };
}