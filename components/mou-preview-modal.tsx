"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCw, X, Download, ExternalLink } from "lucide-react";

type MOUPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mouUrl: string;
  title?: string;
};

export function MOUPreviewModal({
  open,
  onOpenChange,
  mouUrl,
  title = "Preview MOU",
}: MOUPreviewModalProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Reset zoom dan rotation saat modal dibuka
  React.useEffect(() => {
    if (open) {
      setScale(1);
      setRotation(0);
    }
  }, [open]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  // Handle pinch zoom untuk touch devices
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !open) return;

    let initialDistance = 0;
    let initialScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.min(Math.max(initialScale * scaleChange, 0.5), 3);
        setScale(newScale);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [open, scale]);

  // Handle wheel zoom untuk desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    }
  };

  const isPDF = mouUrl.toLowerCase().includes('.pdf');
  const isImage = mouUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || mouUrl.includes('image');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {isImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reset"
              >
                Reset
              </Button>
              <a
                href={mouUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 bg-gray-100 min-h-[60vh] max-h-[75vh] flex items-center justify-center"
          onWheel={handleWheel}
        >
          {isPDF ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <iframe
                src={mouUrl}
                className="w-full h-full min-h-[60vh] border-0 rounded"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
                title="MOU PDF Preview"
              />
            </div>
          ) : isImage ? (
            <div
              className="transition-transform duration-200 cursor-move"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={mouUrl}
                alt="MOU Preview"
                className="max-w-full max-h-full object-contain rounded shadow-lg"
                draggable={false}
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">
                Preview tidak tersedia untuk file ini.
              </p>
              <a
                href={mouUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                <Download className="h-4 w-4" />
                Download File
              </a>
            </div>
          )}
        </div>

        <div className="p-4 pt-2 border-t bg-white">
          <p className="text-xs text-gray-500 text-center">
            Gunakan scroll mouse + Ctrl untuk zoom, atau pinch zoom di perangkat touch
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

