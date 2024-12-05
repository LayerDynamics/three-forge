// src/utils/VideoLoader.ts
export class VideoLoader {
  load(
    url: string,
    onLoad: (video: HTMLVideoElement) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (event: ErrorEvent) => void
  ): void {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.load();

    video.onloadeddata = () => {
      onLoad(video);
    };

    video.onerror = (e) => {
      if (onError) onError(new ErrorEvent('error', { message: 'Failed to load video.' }));
    };

    if (onProgress) {
      video.onprogress = onProgress;
    }
  }
}
