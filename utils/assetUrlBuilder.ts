const BASE_URL = "https://unitedwelfarefoundation.com/assets";

export const getFormDataAsset = (filename: string): string => {
  return `${BASE_URL}/FormData/${filename}`;
};

export const getUserDataAsset = (filename: string): string => {
  return `${BASE_URL}/UserData/${filename}`;
};

export const getAcknowledgementDataAsset = (filename: string): string => {
  return `${BASE_URL}/Acknowledgment_Data/${filename}`;
};
