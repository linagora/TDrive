---
description: Documents database models
---

# Database models

**DriveFile**

```javascript
{
  // Primary Key
  "company_id": uuid;
  "id": uuid;

  "parent_id": string;
  "is_in_trash": boolean;
  "is_directory": boolean;
  "name": string;
  "extension": string;
  "description": string;
  "tags": string[];
  "added": string;
  "last_modified": string;
  "access_info": AccessInformation;
  "content_keywords": string;
  "hidden_data": unknown;
  "last_version_cache": Partial<FileVersion>;
}

type AccessInformation = {
  public: {
    token: string;
    password: string;
    expiration: number;
    level: publicAccessLevel;
  };
  entities: AuthEntity[];
};

type AuthEntity = {
  type: "user" | "channel" | "company" | "folder";
  id: string | "parent";
  level: publicAccessLevel | DriveFileAccessLevel;
};
```

**FileVersion**

```javascript
{
  "id": string;
  "provider": "internal" | "drive" | string;
  "file_id": string;
  "file_metadata": DriveFileMetadata;
  "date_added": number;
  "creator_id": string;
  "application_id": string;
  "realname": string;
  "key": string;
  "mode": string | "OpenSSL-2";
  "file_size": number;
  "filename": string;
  "data": unknown;
}

type DriveFileMetadata = {
  source: "internal" | "drive" | string;
  external_id: string;

  name?: string;
  mime?: string;
  size?: number;
  thumbnails?: DriveFileThumbnail;
};

type DriveFileThumbnail = {
  index: number;
  id: string;

  type: string;
  size: number;
  width: number;
  height: number;

  url: string;
  full_url?: string;
};
```
