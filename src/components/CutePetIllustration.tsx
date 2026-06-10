import React, { useState, useEffect } from "react";

interface CutePetIllustrationProps {
  postId: string;
  speciesTag: "dog" | "cat" | "both";
  tags: string[];
  className?: string;
  alt?: string;
}

export default function CutePetIllustration({
  postId,
  speciesTag,
  tags,
  className = "w-full h-full object-cover",
  alt = "Cute Pet Illustration",
}: CutePetIllustrationProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    // session caching to prevent multiple repetitive API hits during session
    const cacheKey = `illustration_${postId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setImageUrl(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, speciesTag, tags }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("API responded with error");
        }
        return res.json();
      })
      .then((data) => {
        if (active && data?.imageUrl) {
          setImageUrl(data.imageUrl);
          sessionStorage.setItem(cacheKey, data.imageUrl);
        }
      })
      .catch((err) => {
        console.warn("Illustration API error, loading local high-trust fallback:", err.message);
        if (active) {
          let fallback = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"; // dog
          if (speciesTag === "cat") {
            fallback = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80";
          } else if (speciesTag === "both") {
            fallback = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80";
          }
          setImageUrl(fallback);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [postId, speciesTag]);

  if (loading) {
    return (
      <div className="w-full h-full bg-[#E3E1D7]/20 flex flex-col items-center justify-center relative overflow-hidden animate-pulse min-h-[140px] rounded-2xl border border-dashed border-[#D3D1C7]">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[18px] animate-bounce">🎨</span>
          <span className="text-[9px] font-extrabold text-[#888780] uppercase tracking-wider">
            Imagen drawing cute pet...
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E07A5F]/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      className={className}
      alt={alt}
      referrerPolicy="no-referrer"
    />
  );
}
