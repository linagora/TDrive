import { WebsocketMetadata } from "../../utils/types";
import CompanyEntity from "./entities/company";
import UserEntity from "./entities/user";

/**
 * User Rooms
 */
export function getUserRooms(user: UserEntity): WebsocketMetadata[] {
  return [
    {
      room: getUserRoom(user.id),
    },
  ];
}

export function getUserRoom(userId: string): string {
  return `/me/${userId}`;
}

export function getPublicUserRoom(userId: string): string {
  return `/users/${userId}`;
}

export function getUserName(userId: string): string {
  return `user-room-${userId}`;
}

/**
 * Company Rooms
 */
export function getCompanyRooms(company: CompanyEntity): WebsocketMetadata[] {
  return [
    {
      room: getCompanyRoom(company.id),
    },
  ];
}

export function getCompanyRoom(companyId: string): string {
  return `/company/${companyId}`;
}

export function getCompanyName(companyId: string): string {
  return `company-room-${companyId}`;
}
