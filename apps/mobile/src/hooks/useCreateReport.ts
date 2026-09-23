import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

type UploadParams = {
  photoUris: string[];
  latitude: number;
  longitude: number;
  incidentOccurredAt?: string;
};

type CreateReportResult = {
  reportId: string;
  reportNumber: string;
  status: string;
};

export const useCreateReport = () => {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (params: UploadParams): Promise<CreateReportResult> => {
      setIsUploading(true);

      try {
        // Build multipart/form-data
        const formData = new FormData();

        params.photoUris.forEach((uri, index) => {
          // React Native FormData accepts this shape
          formData.append('images[]', {
            uri,
            name: `photo_${index}.jpg`,
            type: 'image/jpeg',
          } as any);
        });

        formData.append('latitude', String(params.latitude));
        formData.append('longitude', String(params.longitude));

        if (params.incidentOccurredAt) {
          formData.append(
            'incidentOccurredAt',
            params.incidentOccurredAt
          );
        } else {
          formData.append(
            'incidentOccurredAt',
            new Date().toISOString()
          );
        }

        const res = await apiClient.post('/reports', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return res.data.data as CreateReportResult;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return { upload, isUploading };
};