import { WebsocketMetadata } from "../../utils/types";

export function getCompanyApplicationRooms(companyId: string): WebsocketMetadata[] {
  return [
    {
      room: getCompanyApplicationRoom(companyId),
    },
  ];
}

export function getCompanyApplicationRoom(companyApplicationId: string): string {
  return `/company-application/${companyApplicationId}`;
}
