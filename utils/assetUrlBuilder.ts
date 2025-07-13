const BASE_URL = "http://localhost:5000/assets";

export const getFormDataAsset = (filename: string): string => {
  return `${BASE_URL}/FormData/${filename}`;
};

export const getUserDataAsset = (filename: string): string => {
  return `${BASE_URL}/UserData/${filename}`;
};

export const getAcknowledgementDataAsset = (filename: string): string => {
  return `${BASE_URL}/Acknowledgment_Data/${filename}`;
};