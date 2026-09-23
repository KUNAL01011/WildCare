import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import { REPORTS_KEY } from "./useReports";

type ReviewFields = {
  animalName?: string;
  citizenCondition?: string;
  severity?: string;
  description?: string;
};

export const useReviewReport = (reportId: string) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-save citizen edits
  const save = useCallback(
    async (fields: ReviewFields) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await reportsApi.patch(reportId, fields);
        // Invalidate so detail screen refetches
        queryClient.invalidateQueries({
          queryKey: [REPORTS_KEY, reportId],
        });
      } catch (err: any) {
        setSaveError(err?.message ?? "Could not save changes.");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [reportId]
  );

  // Final submission
  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await reportsApi.submit(reportId);
      queryClient.invalidateQueries({
        queryKey: [REPORTS_KEY],
      });
    } catch (err: any) {
      setSubmitError(err?.message ?? "Could not submit report.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [reportId]);

  return {
    save,
    submit,
    isSaving,
    isSubmitting,
    saveError,
    submitError,
  };
};
