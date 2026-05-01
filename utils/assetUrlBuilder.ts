import { ASSET_BASE_URL } from "./runtimeConfig";

export const getFormDataAsset = (filename: string): string => {
  return `${ASSET_BASE_URL}/FormData/${filename}`;
};

export const getUserDataAsset = (filename: string): string => {
  return `${ASSET_BASE_URL}/UserData/${filename}`;
};

export const getAcknowledgementDataAsset = (filename: string): string => {
  return `${ASSET_BASE_URL}/Acknowledgment_Data/${filename}`;
};
