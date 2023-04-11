/* eslint-disable @typescript-eslint/no-explicit-any */
import Observable from '../../../deprecated/Observable/Observable';

type Rights = 'guest' | 'member' | 'moderator' | 'admin';
export type RightsOrNone = Rights | 'none';

const rightLevels = {
  none: 0,
  guest: 1,
  member: 10,
  moderator: 40,
  admin: 50,
  owner: 60,
};

class AccessRightsService extends Observable {
  workspaceLevels: { [workspaceId: string]: Rights } = {};
  companyLevels: { [companyId: string]: Rights } = {};

  constructor() {
    super();
    (window as any).AccessRightsService = this;
  }

  /**
   * Check if the user has at least the given right in the workspace
   *
   * @param workspaceId
   * @param right
   * @returns
   */
  public hasLevel(workspaceId = '', right: RightsOrNone): boolean {
    return rightLevels[this.workspaceLevels[workspaceId] || 'none'] >= rightLevels[right];
  }

  /**
   * Get the user level in the given workspace
   *
   * @param workspaceId
   * @returns
   */
  public getLevel(workspaceId = ''): RightsOrNone {
    return this.workspaceLevels[workspaceId] || 'none';
  }

  /**
   * Update the workspace level
   *
   * @param workspaceId
   * @param right
   */
  public updateLevel(workspaceId: string, right: RightsOrNone) {
    delete this.workspaceLevels[workspaceId];
    if (right !== 'none') this.workspaceLevels[workspaceId] = right;
    this.notify();
  }

  public resetLevels() {
    this.workspaceLevels = {};
    this.companyLevels = {};
    this.notify();
  }

  /**
   * Update the company level
   *
   * @param companyId
   * @param right
   */
  public updateCompanyLevel(companyId: string, right: RightsOrNone) {
    delete this.companyLevels[companyId];
    if (right !== 'none') this.companyLevels[companyId] = right;
    this.notify();
  }

  /**
   * Check if the level is at least the given one in the company
   *
   * @param companyId
   * @param right
   * @returns
   */
  public hasCompanyLevel(companyId = '', right: RightsOrNone) {
    return rightLevels[this.companyLevels[companyId] || 'none'] >= rightLevels[right];
  }

  /**
   * Get the company level
   *
   * @param companyId
   * @returns
   */
  public getCompanyLevel(companyId = ''): RightsOrNone {
    return this.companyLevels[companyId] || 'none';
  }
}

export default new AccessRightsService();
