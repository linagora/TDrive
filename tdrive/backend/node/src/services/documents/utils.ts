import mimes from "../../utils/mime";
import { merge } from "lodash";
import { DriveFile } from "./entities/drive-file";
import {
  CompanyExecutionContext,
  DriveExecutionContext,
  DriveFileAccessLevel,
  RootType,
  TrashType,
} from "./types";
import crypto from "crypto";
import { FileVersion, DriveFileMetadata } from "./entities/file-version";
import globalResolver from "../global-resolver";
import Repository from "../../core/platform/services/database/services/orm/repository/repository";
import archiver from "archiver";
import { Readable } from "stream";
import { stopWords } from "./const";
import unoconv from "unoconv-promise";
import {
  writeToTemporaryFile,
  cleanFiles,
  getTmpFile,
  readFromTemporaryFile,
  readableToBuffer,
} from "../../utils/files";
import PdfParse from "pdf-parse";
import _ from "lodash";
import { logger } from "../../core/platform/framework";

/**
 * Returns the default DriveFile object using existing data
 *
 * @param {Partial<DriveFile>} item - the partial drive file item.
 * @param {CompanyExecutionContext} context - the company execution context
 * @returns {DriveFile} - the Default DriveFile
 */
export const getDefaultDriveItem = (
  item: Partial<DriveFile>,
  context: CompanyExecutionContext,
): DriveFile => {
  const defaultDriveItem = merge<DriveFile, Partial<DriveFile>>(new DriveFile(), {
    company_id: context.company.id,
    added: item.added || new Date().getTime().toString(),
    creator: item.creator || context.user?.id,
    is_directory: item.is_directory || false,
    is_in_trash: item.is_in_trash || false,
    last_modified: new Date().getTime().toString(),
    parent_id: item.parent_id || "root",
    content_keywords: item.content_keywords || "",
    description: item.description || "",
    access_info: item.access_info || {
      entities: [
        {
          id: "parent",
          type: "folder",
          level: "manage",
        },
        {
          id: item.company_id,
          type: "company",
          level: "none",
        },
        {
          id: context.user?.id,
          type: "user",
          level: "manage",
        },
      ],
      public: {
        level: "none",
        password: "",
        expiration: 0,
        token: generateAccessToken(),
      },
    },
    extension: item.extension || "",
    last_version_cache: item.last_version_cache,
    name: item.name || "",
    size: item.size || 0,
    tags: item.tags || [],
  });

  if (item.id) {
    defaultDriveItem.id = item.id;
  }

  return defaultDriveItem;
};

/**
 * Returns the default FileVersion item.
 *
 * @param {Partial<FileVersion>} version - the partial version item
 * @param {CompanyExecutionContext} context - the execution context
 * @returns
 */
export const getDefaultDriveItemVersion = (
  version: Partial<FileVersion>,
  context: CompanyExecutionContext,
): FileVersion => {
  const defaultVersion = merge(new FileVersion(), {
    application_id: version.application_id || "",
    creator_id: version.creator_id || context.user?.id,
    data: version.data || {},
    date_added: version.date_added || new Date().getTime(),
    drive_item_id: version.drive_item_id || "",
    file_metadata: version.file_metadata || {},
    file_size: version.file_size || 0,
    filename: version.filename || "",
    key: version.key || "",
    mode: version.mode || "OpenSSL-2",
    provider: version.provider,
    realname: version.realname,
  });

  if (version.id) {
    defaultVersion.id = version.id;
  }

  return defaultVersion;
};

/**
 * Generates a random sha1 access token
 *
 * @returns {String} - the random access token ( sha1 hex digest ).
 */
export const generateAccessToken = (): string => {
  const randomBytes = crypto.randomBytes(64);

  return crypto.createHash("sha1").update(randomBytes).digest("hex");
};

/**
 * Checks if the level meets the required level.
 *
 * @param {publicAccessLevel | DriveFileAccessLevel} requiredLevel
 * @param {publicAccessLevel} level
 * @returns {boolean}
 */
export const hasAccessLevel = (
  requiredLevel: DriveFileAccessLevel | "none",
  level: DriveFileAccessLevel | "none",
): boolean => {
  if (requiredLevel === level) return true;

  if (requiredLevel === "write") {
    return level === "manage";
  }

  if (requiredLevel === "read") {
    return level === "manage" || level === "write";
  }

  return requiredLevel === "none";
};

/**
 * checks the current user is a guest
 *
 * @param {CompanyExecutionContext} context
 * @returns {Promise<boolean>}
 */
export const isCompanyGuest = async (context: CompanyExecutionContext): Promise<boolean> => {
  const userRole = await globalResolver.services.companies.getUserRole(
    context.company.id,
    context.user?.id,
  );

  return userRole === "guest" || !userRole;
};

/**
 * checks the current user is a admin
 *
 * @param {CompanyExecutionContext} context
 * @returns {Promise<boolean>}
 */
export const isCompanyAdmin = async (context: CompanyExecutionContext): Promise<boolean> => {
  const userRole = await globalResolver.services.companies.getUserRole(
    context.company.id,
    context.user?.id,
  );

  return userRole === "admin";
};

/**
 * Calculates the size of the Drive Item
 *
 * @param {DriveFile} item - The file or directory
 * @param {Repository<DriveFile>} repository - the database repository
 * @param {CompanyExecutionContext} context - the execution context
 * @returns {Promise<number>} - the size of the Drive Item
 */
export const calculateItemSize = async (
  item: DriveFile | TrashType | RootType,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext,
): Promise<number> => {
  if (item === "trash") {
    const trashedItems = await repository.find(
      { company_id: context.company.id, parent_id: "trash" },
      {},
      context,
    );

    return trashedItems.getEntities().reduce((acc, curr) => acc + curr.size, 0);
  }

  if (item === "root" || !item) {
    const rootFolderItems = await repository.find(
      { company_id: context.company.id, parent_id: "root" },
      {},
      context,
    );

    return rootFolderItems.getEntities().reduce((acc, curr) => acc + curr.size, 0);
  }

  if (item.is_directory) {
    const children = await repository.find(
      {
        company_id: context.company.id,
        parent_id: item.id,
      },
      {},
      context,
    );

    return children.getEntities().reduce((acc, curr) => acc + curr.size, 0);
  }

  return item.size;
};

/**
 * Recalculates and updates the Drive item size
 *
 * @param {string} id - the item id
 * @param {Repository<DriveFile>} repository
 * @param {CompanyExecutionContext} context - the execution context
 * @returns {Promise<void>}
 */
export const updateItemSize = async (
  id: string,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext,
): Promise<void> => {
  if (!id || id === "root" || id === "trash") return;

  const item = await repository.findOne({ id, company_id: context.company.id });

  if (!item) {
    throw Error("Drive item doesn't exist");
  }

  item.size = await calculateItemSize(item, repository, context);

  await repository.save(item);

  if (item.parent_id === "root" || item.parent_id === "trash") {
    return;
  }

  await updateItemSize(item.parent_id, repository, context);
};

/**
 * gets the path for the driveitem
 *
 * @param {string} id
 * @param {Repository<DriveFile>} repository
 * @param {boolean} ignoreAccess
 * @param {CompanyExecutionContext} context
 * @returns
 */
export const getPath = async (
  id: string,
  repository: Repository<DriveFile>,
  ignoreAccess?: boolean,
  context?: DriveExecutionContext,
): Promise<DriveFile[]> => {
  id = id || "root";
  if (id === "root" || id === "trash")
    return !context.public_token || ignoreAccess
      ? [
          {
            id,
            name: id === "root" ? "Home" : "Trash",
          } as DriveFile,
        ]
      : [];

  const item = await repository.findOne({
    id,
    company_id: context.company.id,
  });

  if (!item || (!(await checkAccess(id, item, "read", repository, context)) && !ignoreAccess)) {
    return [];
  }

  return [...(await getPath(item.parent_id, repository, ignoreAccess, context)), item];
};

/**
 * checks if access can be granted for the drive item
 *
 * @param {string} id
 * @param {DriveFile | null} item
 * @param {DriveFileAccessLevel} level
 * @param {Repository<DriveFile>} repository
 * @param {CompanyExecutionContext} context
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const checkAccess = async (
  id: string,
  item: DriveFile | null,
  level: DriveFileAccessLevel,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext & { public_token?: string; tdrive_tab_token?: string },
): Promise<boolean> => {
  if (context.user?.server_request) {
    return true;
  }

  const grantedLevel = await getAccessLevel(id, item, repository, context);
  const hasAccess = hasAccessLevel(level, grantedLevel);
  logger.info(
    `Got level ${grantedLevel} for drive item ${id} and required ${level} - returning ${hasAccess}`,
  );
  return hasAccess;
};

/**
 * get maximum level for the drive item
 *
 * @param {string} id
 * @param {DriveFile | null} item
 * @param {Repository<DriveFile>} repository
 * @param {CompanyExecutionContext} context
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export const getAccessLevel = async (
  id: string,
  item: DriveFile | null,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext & { public_token?: string; tdrive_tab_token?: string },
): Promise<DriveFileAccessLevel | "none"> => {
  if (!id || id === "root")
    return !context?.user?.id ? "none" : (await isCompanyGuest(context)) ? "read" : "manage";
  if (id === "trash")
    return (await isCompanyGuest(context)) || !context?.user?.id
      ? "none"
      : (await isCompanyAdmin(context))
      ? "manage"
      : "write";

  let publicToken = context.public_token;

  try {
    item =
      item ||
      (await repository.findOne({
        id,
        company_id: context.company.id,
      }));

    if (!item) {
      throw Error("Drive item doesn't exist");
    }

    /*
     * Specific user or channel rule is applied first. Then less restrictive level will be chosen
     * between the parent folder and company accesses.
     */

    //Public access
    if (publicToken) {
      if (!item.access_info.public.token) return "none";
      const { token: itemToken, level: itemLevel, password, expiration } = item.access_info.public;
      if (expiration && expiration < Date.now()) return "none";
      if (password) {
        const data = publicToken.split("+");
        if (data.length !== 2) return "none";
        const [extractedPublicToken, publicTokenPassword] = data;
        if (publicTokenPassword !== password) return "none";
        publicToken = extractedPublicToken;
      }
      if (itemToken === publicToken) return itemLevel;
    }

    const accessEntities = item.access_info.entities || [];
    const otherLevels = [];

    //From there a user must be logged in
    if (context?.user?.id) {
      //Users
      const matchingUser = accessEntities.find(a => a.type === "user" && a.id === context.user?.id);
      if (matchingUser) return matchingUser.level;

      //Channels
      if (context.tdrive_tab_token) {
        try {
          const [channelId] = context.tdrive_tab_token.split("+"); //First item will be the channel id
          const matchingChannel = accessEntities.find(
            a => a.type === "channel" && a.id === channelId,
          );
          if (matchingChannel) return matchingChannel.level;
        } catch (e) {
          console.log(e);
        }
      }

      //Companies
      const matchingCompany = accessEntities.find(
        a => a.type === "company" && a.id === context.company.id,
      );
      if (matchingCompany) otherLevels.push(matchingCompany.level);
    }

    //Parent folder
    const maxParentFolderLevel =
      accessEntities.find(a => a.type === "folder" && a.id === "parent")?.level || "none";
    if (maxParentFolderLevel === "none") {
      otherLevels.push(maxParentFolderLevel);
    } else {
      const parentFolderLevel = await getAccessLevel(item.parent_id, null, repository, context);
      otherLevels.push(parentFolderLevel);
    }

    //Return least restrictive level of otherLevels
    return otherLevels.reduce(
      (previousValue, b) =>
        hasAccessLevel(b as DriveFileAccessLevel, previousValue as DriveFileAccessLevel)
          ? previousValue
          : b,
      "none",
    ) as DriveFileAccessLevel | "none";
  } catch (error) {
    throw Error(error);
  }
};

/**
 * Isolate access level information from parent folder logic
 * Used when putting folder in the trash
 * @param id
 * @param item
 * @param repository
 */
export const makeStandaloneAccessLevel = async (
  companyId: string,
  id: string,
  item: DriveFile | null,
  repository: Repository<DriveFile>,
  options: { removePublicAccess?: boolean } = { removePublicAccess: true },
): Promise<DriveFile["access_info"]> => {
  item =
    item ||
    (await repository.findOne({
      id,
      company_id: companyId,
    }));

  if (!item) {
    throw Error("Drive item doesn't exist");
  }

  const accessInfo = _.cloneDeep(item.access_info);

  if (options?.removePublicAccess && accessInfo?.public?.level) accessInfo.public.level = "none";

  const parentFolderAccess = accessInfo.entities.find(
    a => a.type === "folder" && a.id === "parent",
  );

  if (!parentFolderAccess || parentFolderAccess.level === "none") {
    return accessInfo;
  } else if (item.parent_id !== "root" && item.parent_id !== "trash") {
    // Get limitations from parent folder
    const accessEntitiesFromParent = await makeStandaloneAccessLevel(
      companyId,
      item.parent_id,
      null,
      repository,
      options,
    );

    let mostRestrictiveFolderLevel = parentFolderAccess.level as DriveFileAccessLevel | "none";

    const keptEntities = accessEntitiesFromParent.entities.filter(a => {
      if (["user", "channel"].includes(a.type)) {
        return !accessInfo.entities.find(b => b.type === a.type && b.id === a.id);
      } else {
        if (a.type === "folder" && a.id === "parent") {
          mostRestrictiveFolderLevel = hasAccessLevel(a.level, mostRestrictiveFolderLevel)
            ? a.level
            : mostRestrictiveFolderLevel;
        }
        return false;
      }
    });

    accessInfo.entities = accessInfo.entities.map(a => {
      if (a.type === "folder" && a.id === "parent") {
        a.level = mostRestrictiveFolderLevel;
      }
      return a;
    }) as DriveFile["access_info"]["entities"];

    accessInfo.entities = [...accessInfo.entities, ...keptEntities];
  }

  return accessInfo;
};

/**
 * Adds drive items to an archive recursively
 *
 * @param {string} id - the drive item id
 * @param {DriveFile | null } entity - the drive item entity
 * @param {archiver.Archiver} archive - the archive
 * @param {Repository<DriveFile>} repository - the repository
 * @param {CompanyExecutionContext} context - the execution context
 * @param {string} prefix - folder prefix
 * @returns {Promise<void>}
 */
export const addDriveItemToArchive = async (
  id: string,
  entity: DriveFile | null,
  archive: archiver.Archiver,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext,
  prefix?: string,
): Promise<void> => {
  const item = entity || (await repository.findOne({ id, company_id: context.company.id }));

  if (!item) {
    throw Error("item not found");
  }

  if (!item.is_directory) {
    const file_id = item.last_version_cache.file_metadata.external_id;
    const file = await globalResolver.services.files.download(file_id, context);

    if (!file) {
      throw Error("file not found");
    }

    archive.append(file.file, { name: file.name, prefix: prefix ?? "" });
    return;
  } else {
    const items = await repository.find({
      parent_id: item.id,
      company_id: context.company.id,
    });

    for (const child of items.getEntities()) {
      await addDriveItemToArchive(
        child.id,
        child,
        archive,
        repository,
        context,
        `${prefix || ""}${item.name}/`,
      );
    }

    return;
  }
};

/**
 * Extracts the most popular 250 keywords from a text.
 *
 * @param {string} data - file data string.
 * @returns {string}
 */
export const extractKeywords = (data: string): string => {
  const words = data.toLowerCase().split(/[^a-zA-Z']+/);
  const filteredWords = words.filter(word => !stopWords.includes(word) && word.length > 3);

  const wordFrequency = filteredWords.reduce((acc: Record<string, number>, word: string) => {
    acc[word] = (acc[word] || 0) + 1;

    return acc;
  }, {});

  const sortedFrequency = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc: Record<string, number>, [key, val]) => {
      acc[key] = val;

      return acc;
    }, {});

  return Object.keys(sortedFrequency).slice(0, 250).join(" ");
};

/**
 * Converts an office file stream into a human readable string.
 *
 * @param {Readable} file - the input file stream.
 * @param {string} extension - the file extension.
 * @returns {Promise<string>}
 */
export const officeFileToString = async (file: Readable, extension: string): Promise<string> => {
  const officeFilePath = await writeToTemporaryFile(file, extension);
  const outputPath = getTmpFile(".pdf");

  try {
    await unoconv.run({
      file: officeFilePath,
      output: outputPath,
    });

    cleanFiles([officeFilePath]);

    return await pdfFileToString(outputPath);
  } catch (error) {
    cleanFiles([officeFilePath]);
    throw Error(error);
  }
};

/**
 * Converts a PDF file stream into a human readable string.
 *
 * @param {Readable | string} file - the input file stream or path.
 * @returns {Promise<string>}
 */
export const pdfFileToString = async (file: Readable | string): Promise<string> => {
  let inputBuffer: Buffer;

  try {
    if (typeof file === "string") {
      inputBuffer = await readFromTemporaryFile(file);
      cleanFiles([file]);
    } else {
      inputBuffer = await readableToBuffer(file);
    }

    const result = await PdfParse(inputBuffer);

    return result.text;
  } catch (error) {
    if (typeof file === "string") {
      cleanFiles([file]);
    }

    throw Error(error);
  }
};

/**
 * returns the file metadata.
 *
 * @param {string} fileId - the file id
 * @param {CompanyExecutionContext} context - the execution context
 * @returns {DriveFileMetadata}
 */
export const getFileMetadata = async (
  fileId: string,
  context: CompanyExecutionContext,
): Promise<DriveFileMetadata> => {
  const file = await globalResolver.services.files.getFile(
    {
      id: fileId,
      company_id: context.company.id,
    },
    context,
    { ...(context.user.server_request ? {} : { waitForThumbnail: true }) },
  );

  if (!file) {
    throw Error("File doesn't exist");
  }

  return {
    source: "internal",
    external_id: fileId,
    mime: file.metadata.mime,
    name: file.metadata.name,
    size: file.upload_data.size,
    thumbnails: file.thumbnails,
  } as DriveFileMetadata;
};

/**
 * Finds a suitable name for an item based on items inside the same folder.
 *
 * @param {string} parent_id - the parent id.
 * @param {string} name - the item name.
 * @param {Repository<DriveFile>} repository - the drive repository.
 * @param {CompanyExecutionContext} context - the execution context.
 * @returns {Promise<string>} - the drive item name.
 */
export const getItemName = async (
  parent_id: string,
  id: string,
  name: string,
  is_directory: boolean,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext,
): Promise<string> => {
  try {
    let newName = name.substring(0, 255);
    let exists = true;
    const children = await repository.find(
      {
        parent_id,
        company_id: context.company.id,
      },
      {},
      context,
    );

    while (exists) {
      exists = !!children
        .getEntities()
        .find(
          child => child.name === newName && child.is_directory === is_directory && child.id !== id,
        );

      if (exists) {
        const ext = newName.split(".").pop();
        newName =
          ext && ext !== newName ? `${newName.slice(0, -ext.length - 1)}-2.${ext}` : `${newName}-2`;
      }
    }

    return newName;
  } catch (error) {
    throw Error("Failed to get item name");
  }
};

/**
 * Checks if an item can be moved to its destination
 * An item cannot be moved to itself or any of its derived chilren.
 *
 * @param {string} source - the to be moved item id.
 * @param {string} target - the to be moved to item id.
 * @param {string} repository - the Drive item repository.
 * @param {CompanyExecutionContex} context - the execution context.
 * @returns {Promise<boolean>} - whether the move is possible or not.
 */
export const canMoveItem = async (
  source: string,
  target: string,
  repository: Repository<DriveFile>,
  context: CompanyExecutionContext,
): Promise<boolean> => {
  if (source === target) return false;
  if (target === "root" || target === "trash") return true;

  const item = await repository.findOne({
    id: source,
    company_id: context.company.id,
  });

  if (!item.is_directory) {
    return true;
  }

  const targetItem = await repository.findOne({
    id: target,
    company_id: context.company.id,
  });

  if (!targetItem || !targetItem.is_directory) {
    throw Error("target item doesn't exist or not a directory");
  }

  if (!(await checkAccess(target, targetItem, "write", repository, context))) {
    return false;
  }

  if (!item) {
    throw Error("Item not found");
  }

  const children = (
    await repository.find({
      parent_id: source,
      company_id: context.company.id,
    })
  ).getEntities();

  if (children.some(child => child.id === target)) {
    return false;
  }

  for (const child of children) {
    if (child.is_directory && !(await canMoveItem(child.id, target, repository, context))) {
      return false;
    }
  }

  return true;
};

export function isFileType(fileMime: string, fileName: string, requiredExtensions: string[]): any {
  const extension = fileName.split(".").pop();
  const secondaryExtensions = Object.keys(mimes).filter(k => mimes[k] === fileMime);
  const fileExtensions = [extension, ...secondaryExtensions];
  return fileExtensions.some(e => requiredExtensions.includes(e));
}
