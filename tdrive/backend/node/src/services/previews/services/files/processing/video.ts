import ffmpeg from "fluent-ffmpeg";
import { temporaryThumbnailFile, ThumbnailResult } from "../../../types";
import fs from "fs";
import { cleanFiles, getTmpFile } from "../../../../../utils/files";

/**
 * Generate thumbnails for given video files.
 *
 * @param {String[]} videoPaths - the input video paths
 * @returns {Promise<ThumbnailResult[]>} - resolves when the thumbnails are generated
 */
export async function generateVideoPreview(videoPaths: string[]): Promise<ThumbnailResult[]> {
  const output: ThumbnailResult[] = [];

  for (const videoPath of videoPaths) {
    const { fileName, folder, filePath } = getTemporaryThumbnailFile();

    try {
      const { width, height } = await takeVideoScreenshot(videoPath, folder, fileName);

      output.push({
        ...getThumbnailInformation(filePath),
        width,
        height,
      });
    } catch (error) {
      cleanFiles([filePath]);
      throw Error(`failed to generate video preview: ${error}`);
    }
  }

  return output;
}

/**
 * Generate one thumbnail from a single video file.
 * the thumbnail is the first frame from the video
 *
 * @param {String} inputPath  - the input video Path
 * @param {String} outputFolder - the output folder
 * @param {String} outputFile  - the output file name
 * @returns {Primise} - resolves when the thumbnail is generated
 */
const takeVideoScreenshot = async (
  inputPath: string,
  outputFolder: string,
  outputFile: string,
): Promise<{ width: number; height: number }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { width, height } = await getVideoDimensions(inputPath);
      const { width: outputWidth, height: outputHeight } = calculateThumbnailDimensions(
        width,
        height,
      );

      ffmpeg(inputPath)
        .screenshot({
          count: 1,
          filename: outputFile,
          folder: outputFolder,
          timemarks: ["0"],
          size: `${outputWidth}x${outputHeight}`,
        })
        .on("end", () => {
          resolve({ width: outputWidth, height: outputHeight });
        })
        .on("error", error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get the generated thumbnail information.
 *
 * @param {String} path - the path to the thumbnail
 * @param {PreviewMessageQueueRequest["output"]} options - the options for the thumbnails
 * @returns { { path: string, type: string, size: number } } - the thumbnail information
 */
const getThumbnailInformation = (
  path: string,
): {
  path: string;
  type: string;
  size: number;
} => {
  const stats = fs.statSync(path);

  return {
    size: stats.size,
    type: "image/jpg",
    path,
  };
};

/**
 * generate a temporary thumbnail file.
 *
 * @returns {temporaryThumbnailFile} - the temporary thumbnail file information
 */
const getTemporaryThumbnailFile = (): temporaryThumbnailFile => {
  const filePath = `${getTmpFile()}.jpg`;
  const fileName = filePath.split("/").pop();
  const folder = filePath.substring(0, filePath.lastIndexOf("/"));

  return {
    folder,
    fileName,
    filePath,
  };
};

/**
 * Detect video dimensions
 *
 * @param {String} videoPath - the video path
 * @returns {Promise<{ width: number, height: number }>} - the video dimensions
 */
async function getVideoDimensions(videoPath: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      }

      const { width, height } = metadata.streams[0];
      resolve({ width, height });
    });
  });
}

/**
 * Calculate the thumbnail dimensions.
 * maximum dimension is 1080p and the minimum dimension is 320x240.
 * The aspect ratio is preserved.
 *
 * @param {Number} width - the video width
 * @param {Number} height - the video height
 * @returns { { width: number, height: number } } - the thumbnail dimensions
 */
function calculateThumbnailDimensions(
  width: number,
  height: number,
): {
  width: number;
  height: number;
} {
  let newWidth = Math.min(width, 1920);
  let newHeight = Math.min(height, 1080);
  const ratio = width / height;

  if (width > 1920 || height > 1080) {
    newWidth = Math.min(1920, width);
    newHeight = Math.min(1080, newWidth / ratio);
  }

  if (width < 320 || height < 240) {
    newWidth = Math.max(320, width);
    newHeight = Math.max(240, newWidth / ratio);
  }

  return { width: newWidth, height: newHeight };
}
