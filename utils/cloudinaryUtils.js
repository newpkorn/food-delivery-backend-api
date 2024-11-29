/**
 * Extracts the public ID number from a Cloudinary URL.
 * @param {string} url - The URL of the Cloudinary image.
 * @returns {string|null} - The extracted public ID number or null if not found.
 */

/**
 * Ext: 
 * "/image/upload/v1732849150/food_delivery/food_images/1732849149521.jpg"
 * to "1732849149521"
**/
export const extractPublicIdNumber = (url) => {
  // Regular expression to match the public ID number part of the Cloudinary URL
  const regex = /\/(\d+)(?=\.\w+$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Ext: 
 * "/image/upload/v1732849150/food_delivery/food_images/1732849149521.jpg"
 * to "food_delivery/1732849149521"
**/
export const extractFolderPath = (url) => {
  // Regular expression to match the main folder ('food_delivery') and public ID
  const regex = /\/(food_delivery)\/[\w-]+\/([\d]+)\.\w+$/;
  const match = url.match(regex);
  return match ? `${match[1]}/${match[2]}` : null;
};

/**
 * Ext: 
 * "/image/upload/v1732849150/food_delivery/food_images/1732849149521.jpg"
 * to "food_delivery/food_images//1732849149521"
 **/
export const extractPublicId = (url) => {
  const regex = /\/([^/]+\/[^/]+)\/([^/]+\.[a-z]+)$/;
  const match = url.match(regex);
  return match ? `${match[1]}/${match[2].split('.')[0]}` : null;
};