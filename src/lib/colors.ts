import { useStore } from '../store/useStore';

export const getTagColor = (tag: string) => {
  const customTags = useStore.getState().customTags;
  if (customTags[tag]) {
    return customTags[tag];
  }

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 85%)`; // Light pastel color
};

function adjustColorForText(hex: string) {
  // Simple darkening of a hex code for text
  // Since we assume the custom background is a light color from the color picker
  // We can just use a generic dark color for text if they picked a hex
  return '#1A1A1A'; // very dark gray for contrast on light colors
}

export const getTagTextColor = (tag: string) => {
  const customTags = useStore.getState().customTags;
  if (customTags[tag]) {
    return adjustColorForText(customTags[tag]);
  }

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 25%)`; // Darker text for readability
};
