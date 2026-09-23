import { useQuery, useMutation } from "@tanstack/react-query";
import { respondersApi } from "../api/responders";

export const useResponderMatches = (reportId: string) => {
  return useQuery({
    queryKey: ["responders", reportId],
    queryFn: () => respondersApi.getMatches(reportId),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useResponderDetail = (bodyId: string) => {
  return useQuery({
    queryKey: ["responder", bodyId],
    queryFn: () => respondersApi.getById(bodyId),
    enabled: !!bodyId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useRecordContact = () => {
  return useMutation({
    mutationFn: ({ reportId, bodyId }: { reportId: string; bodyId: string }) =>
      respondersApi.recordContact(reportId, bodyId),
  });
};
