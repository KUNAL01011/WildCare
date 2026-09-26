import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import { REPORTS_KEY } from "./useReports";
import { useToast } from "../components/ui/Toast";

type ReviewFields = {
  animalName?: string;
  citizenCondition?: string;
  severity?: string;
  description?: string;
};

export const useReviewReport = (reportId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const save = useCallback(
    async (fields: ReviewFields) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        await reportsApi.patch(reportId, fields);
        queryClient.invalidateQueries({
          queryKey: [REPORTS_KEY, reportId],
        });
        showToast("Changes saved", "success");
      } catch (err: any) {
        setSaveError(err?.message ?? "Could not save.");
        showToast("Could not save changes", "error");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [reportId, showToast]
  );

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await reportsApi.submit(reportId);
      queryClient.invalidateQueries({
        queryKey: [REPORTS_KEY],
      });
      showToast("Report submitted!", "success");
    } catch (err: any) {
      setSubmitError(err?.message ?? "Could not submit.");
      showToast("Submission failed", "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [reportId, showToast]);

  return {
    save,
    submit,
    isSaving,
    isSubmitting,
    saveError,
    submitError,
  };
};
