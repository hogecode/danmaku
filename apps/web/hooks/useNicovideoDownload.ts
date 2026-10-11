"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { NicovideoApi, Configuration } from "@/lib/generated";
import type {
  VideoDownloadStartResponseDto,
  VideoDownloadStatusResponseDto,
} from "@/lib/generated/models";

export interface DownloadProgress {
  jobId: string;
  step:
    | "queued"
    | "initializing"
    | "accessing_nicovideo"
    | "downloading_video"
    | "downloading_comments"
    | "uploading_s3"
    | "completed";
  percentage: number;
  message: string;
  timestamp: Date;
  error?: string;
  // ダウンロード完了時のデータ
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface DownloadState {
  jobId: string | null;
  status: "idle" | "queued" | "processing" | "completed" | "failed" | "not_found";
  progress: DownloadProgress | null;
  result: any | null;
  error: string | null;
  isLoading: boolean;
}

export function useNicovideoDownload() {
  const [state, setState] = useState<DownloadState>({
    jobId: null,
    status: "idle",
    progress: null,
    result: null,
    error: null,
    isLoading: false,
  });

  const sseRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getApiClient = useCallback(() => {
    const config = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
    });
    return new NicovideoApi(config);
  }, []);

  const connectSSE = useCallback((jobId: string) => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    const sseUrl = `${
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
    }/api/nicovideo/download/progress/${jobId}/sse`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // progress タイプのメッセージ処理
        if (data.type === "progress" && data.progress) {
          setState((prev) => ({
            ...prev,
            progress: { ...data.progress, timestamp: new Date(data.progress.timestamp) },
            status: data.progress.step === "completed" ? "completed" : "processing",
          }));

          if (data.progress.step === "completed") {
            eventSource.close();
            sseRef.current = null;
          }
        }
        
        // completed タイプのメッセージ処理（署名付き URL 含む）
        if (data.type === "completed" && data.data) {
          const completedData = data.data;
          setState((prev) => ({
            ...prev,
            progress: {
              ...prev.progress,
              downloadUrl: completedData.downloadUrl,
              fileName: completedData.fileName,
              fileSize: completedData.fileSize,
              timestamp: new Date(completedData.timestamp),
            } as DownloadProgress,
            status: "completed",
            result: {
              downloadUrl: completedData.downloadUrl,
              fileName: completedData.fileName,
              fileSize: completedData.fileSize,
            },
          }));

          // ファイルを自動ダウンロード
          if (completedData.downloadUrl) {
            const link = document.createElement("a");
            link.href = completedData.downloadUrl;
            link.download = completedData.fileName || "video.mp4";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("ダウンロード開始:", completedData.fileName);
          }

          eventSource.close();
          sseRef.current = null;
        }
      } catch (error) {
        console.error("SSE パース失敗:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE エラー");
      eventSource.close();
      sseRef.current = null;
    };

    sseRef.current = eventSource;
  }, []);

  const startDownload = useCallback(
    async (videoId: string, quality: "high" | "low" | "auto" = "auto") => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const api = getApiClient();
        const response = await api.nicovideoControllerStartVideoDownload({
          videoId,
          quality,
          downloadComments: false,
        });

        const jobId = response.data.jobId;
        setState((prev) => ({
          ...prev,
          jobId,
          status: "queued",
          isLoading: false,
        }));

        connectSSE(jobId);
        return jobId;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "ダウンロード開始失敗";
        setState((prev) => ({
          ...prev,
          error: errorMsg,
          status: "failed",
          isLoading: false,
        }));
        throw error;
      }
    },
    [getApiClient, connectSSE]
  );

  const cancelDownload = useCallback(
    async (jobId: string) => {
      try {
        const api = getApiClient();
        await api.nicovideoControllerCancelDownload(jobId);

        setState((prev) => ({
          ...prev,
          status: "failed",
          error: "ダウンロードをキャンセルしました",
        }));

        if (sseRef.current) {
          sseRef.current.close();
          sseRef.current = null;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "キャンセル失敗";
        setState((prev) => ({ ...prev, error: errorMsg }));
        throw error;
      }
    },
    [getApiClient]
  );

  const reset = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    setState({
      jobId: null,
      status: "idle",
      progress: null,
      result: null,
      error: null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    startDownload,
    cancelDownload,
    reset,
  };
}
