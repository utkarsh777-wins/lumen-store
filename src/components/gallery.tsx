"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];
  if (!image) return <div className="aspect-[4/5] bg-sand" />;

  return (
    <div className="grid gap-3 lg:grid-cols-[4.5rem_1fr]">
      <div className="order-2 flex gap-2 lg:order-1 lg:flex-col" role="list" aria-label={`${name} photos`}>
        {images.map((item, index) => (
          <button
            key={item.url}
            type="button"
            aria-label={`Show photo ${index + 1}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={`relative h-[4.5rem] w-[4.5rem] overflow-hidden border ${index === active ? "border-ink" : "border-transparent"}`}
          >
            <Image
              src={item.url}
              alt=""
              fill
              sizes="72px"
              className="object-cover"
              style={item.url.includes("cer-4") ? { objectPosition: "20% 80%" } : undefined}
            />
          </button>
        ))}
      </div>
      <div className="relative order-1 aspect-[4/5] overflow-hidden bg-sand lg:order-2">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          style={image.url.includes("cer-4") ? { objectPosition: "20% 80%" } : undefined}
        />
      </div>
    </div>
  );
}
