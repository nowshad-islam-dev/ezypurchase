import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import ImageKit from '@imagekit/nodejs';
import httpStatus from 'http-status';
import { ENV } from '../config/env';
import { ApiError } from '../utils/apiError';

const client = new ImageKit({
  privateKey: ENV.imagekitApiKey,
});

const uploadToImageKit = async (
  file: any,
  fileName: string,
  folder: string,
) => {
  const response = await client.files.upload({
    file,
    fileName,
    useUniqueFileName: true,
    folder,
  });
  return response;
};

// Store directly in memory as Buffer
const storage = multer.memoryStorage();
// Allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 }, // 5 mb
});

// single file upload
export const uploadSingle = (fieldName: string, folderName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, async (err) => {
      // handle multer error
      if (err instanceof multer.MulterError) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'File upload failed'));
      } else if (err instanceof Error) {
        return next(new Error('File upload api error'));
      }

      if (!req.file) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'File upload failed'));
      }
      try {
        // convert the file buffer into base64 string
        // for the file upload to work
        const base64File = req.file.buffer.toString('base64');
        const result = await uploadToImageKit(
          base64File,
          req.file.originalname,
          folderName,
        );
        res.locals.fileUrl = result.url;
        next();
      } catch (err) {
        return next(err);
      }
    });
  };
};

// multiple file upload
export const uploadArray = (fieldName: string, folderName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'File upload failed'));
      } else if (err instanceof Error) {
        return next(new Error('File upload api error'));
      }

      if (!(req.files && Array.isArray(req.files) && req.files.length > 0)) {
        return next(new ApiError(httpStatus.BAD_REQUEST, 'File upload failed'));
      }

      try {
        const uploadPromises = req.files.map(async (file) => {
          const base64File = file.buffer.toString('base64');
          const result = await uploadToImageKit(
            base64File,
            file.originalname,
            folderName,
          );
          return result.url;
        });
        const fileUrls = await Promise.all(uploadPromises);
        res.locals.fileUrls = fileUrls;
        next();
      } catch (err) {
        return next(err);
      }
    });
  };
};
