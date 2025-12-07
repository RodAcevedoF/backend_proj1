export interface UploadedFile {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface StoredFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IFileStorage {
  upload(file: UploadedFile, path: string): Promise<StoredFile>;
  delete(fileId: string): Promise<void>;
  getUrl(fileId: string): Promise<string | null>;
}
