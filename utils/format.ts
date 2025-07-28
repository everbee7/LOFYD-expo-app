export const formatSearchedLocation = (location: string): string => {
  if (!location || typeof location !== 'string') {
    return location;
  }

  // Check if the location is numeric coordinates or zip codes
  // Handles formats like: "999, 999", "-200.9000, -90.999", "75201", "40.7128,-74.0060"
  const coordinatePattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$|^\d+$/;
  if (coordinatePattern.test(location.trim())) {
    return location.trim();
  }

  // Split by spaces and capitalize each word
  return location
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;

      // Handle special cases for common location formatting
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s+/g, ' '); // Remove extra spaces
};