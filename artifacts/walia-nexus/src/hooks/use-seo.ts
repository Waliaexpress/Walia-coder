import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
}

export function useSEO({ title, description, ogImage }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Walia Nexus`;
    
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', description);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${title} | Walia Nexus`);

    if (ogImage) {
      let metaImage = document.querySelector('meta[property="og:image"]');
      if (!metaImage) {
        metaImage = document.createElement('meta');
        metaImage.setAttribute('property', 'og:image');
        document.head.appendChild(metaImage);
      }
      metaImage.setAttribute('content', ogImage);
    }
  }, [title, description, ogImage]);
}
