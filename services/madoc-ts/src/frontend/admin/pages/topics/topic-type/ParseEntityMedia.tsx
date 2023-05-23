export function ParseEntityMedia(image: {
  id: string;
  image: string;
  thumbnail: string;
}): { id: string; url: string } | null {
  if (!image) {
    return null;
  }
  if (!image.image.startsWith('http')) {
    return {
      id: image.id,
      url: `${window.location.protocol}//${window.location.host}${image.image}`,
    };
  }
  return {
    id: image.id,
    url: image.image,
  };
}
