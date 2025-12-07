import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export interface ParsedFile {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface UploadConfig {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  fieldName?: string;
  multiple?: boolean;
  maxFiles?: number;
}

// Extend Request type for file uploads
declare global {
  namespace Express {
    interface Request {
      uploadedFile?: ParsedFile;
      uploadedFiles?: ParsedFile[];
    }
  }
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export class UploadMiddleware {
  single(config: UploadConfig = {}) {
    const {
      maxFileSize = DEFAULT_MAX_SIZE,
      allowedMimeTypes,
      fieldName = 'file',
    } = config;

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const contentType = req.headers['content-type'] || '';

        if (!contentType.includes('multipart/form-data')) {
          return next();
        }

        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
          throw AppError.badRequest('Invalid multipart boundary');
        }

        const chunks: Buffer[] = [];
        let totalSize = 0;

        req.on('data', (chunk: Buffer) => {
          totalSize += chunk.length;
          if (totalSize > maxFileSize) {
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });

        req.on('end', () => {
          if (totalSize > maxFileSize) {
            return res.status(413).json({
              error: 'Payload Too Large',
              message: `File size exceeds ${maxFileSize / 1024 / 1024}MB limit`,
            });
          }

          try {
            const body = Buffer.concat(chunks);
            const file = this.parseMultipart(body, boundary, fieldName);

            if (!file) {
              return next();
            }

            if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimeType)) {
              throw AppError.badRequest(
                `File type ${file.mimeType} not allowed. Allowed: ${allowedMimeTypes.join(', ')}`
              );
            }

            req.uploadedFile = file;
            next();
          } catch (err) {
            next(err);
          }
        });

        req.on('error', (err) => next(err));
      } catch (err) {
        next(err);
      }
    };
  }

  image(config: Omit<UploadConfig, 'allowedMimeTypes'> = {}) {
    return this.single({
      ...config,
      allowedMimeTypes: IMAGE_TYPES,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024,
    });
  }

  document(config: Omit<UploadConfig, 'allowedMimeTypes'> = {}) {
    return this.single({
      ...config,
      allowedMimeTypes: DOC_TYPES,
      maxFileSize: config.maxFileSize || 20 * 1024 * 1024,
    });
  }

  media(config: Omit<UploadConfig, 'allowedMimeTypes'> = {}) {
    return this.single({
      ...config,
      allowedMimeTypes: [...IMAGE_TYPES, ...DOC_TYPES],
    });
  }

  private parseMultipart(
    body: Buffer,
    boundary: string,
    targetField: string
  ): ParsedFile | null {
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = this.splitBuffer(body, boundaryBuffer);

    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;

      const headers = part.slice(0, headerEnd).toString();
      const content = part.slice(headerEnd + 4);

      const dispositionMatch = headers.match(
        /Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i
      );
      if (!dispositionMatch) continue;

      const [, fieldName, filename] = dispositionMatch;

      if (fieldName !== targetField || !filename) continue;

      const typeMatch = headers.match(/Content-Type: ([^\r\n]+)/i);
      const mimeType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';

      let fileContent = content;
      const trailingIndex = content.lastIndexOf('\r\n--');
      if (trailingIndex !== -1) {
        fileContent = content.slice(0, trailingIndex);
      }

      return {
        fieldName,
        originalName: filename,
        mimeType,
        size: fileContent.length,
        buffer: fileContent,
      };
    }

    return null;
  }

  private splitBuffer(buffer: Buffer, delimiter: Buffer): Buffer[] {
    const parts: Buffer[] = [];
    let start = 0;
    let index: number;

    while ((index = buffer.indexOf(delimiter, start)) !== -1) {
      if (index > start) {
        parts.push(buffer.slice(start, index));
      }
      start = index + delimiter.length;
    }

    if (start < buffer.length) {
      parts.push(buffer.slice(start));
    }

    return parts;
  }
}

export const uploadMiddleware = new UploadMiddleware();
