import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { MediaItem } from "@/types/villa";

interface MediaGalleryProps {
  media: MediaItem[];
  villaName: string;
}

const MediaGallery = ({ media, villaName }: MediaGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {media.slice(0, 6).map((item, index) => (
          <div
            key={index}
            onClick={() => openLightbox(index)}
            className={`relative cursor-pointer rounded-xl overflow-hidden group ${
              index === 0 ? "col-span-2 row-span-2 h-64 md:h-80" : "h-32 md:h-40"
            }`}
          >
            {item.type === "video" ? (
              <div className="relative w-full h-full bg-muted">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={`${villaName} ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors" />
          </div>
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-foreground/95 border-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 text-background hover:bg-background/20"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative w-full aspect-video flex items-center justify-center">
            {media[currentIndex].type === "video" ? (
              <video
                src={media[currentIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            ) : (
              <img
                src={media[currentIndex].url}
                alt={`${villaName} ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMedia}
                  className="absolute left-4 text-background hover:bg-background/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMedia}
                  className="absolute right-4 text-background hover:bg-background/20"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
          </div>

          <div className="p-4 flex justify-center gap-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-background/50"
                }`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaGallery;
