import { put, del } from "@vercel/blob";

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(file: File, folder: string = "uploads"): Promise<string> {
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("Blob storage not configured");
      }

      const filename = `${folder}/${Date.now()}-${file.name}`;
      const blob = await put(filename, file, {
        access: "public",
      });

      return blob.url;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file");
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    folder: string = "uploads",
  ): Promise<string> {
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("Blob storage not configured");
      }

      const fullPath = `${folder}/${Date.now()}-${filename}`;
      const blob = await put(fullPath, buffer, {
        access: "public",
      });

      return blob.url;
    } catch (error) {
      console.error("Buffer upload error:", error);
      throw new Error("Failed to upload buffer");
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error("Blob storage not configured");
      }

      await del(url);
    } catch (error) {
      console.error("File delete error:", error);
      throw new Error("Failed to delete file");
    }
  }

  async uploadProfilePicture(file: File, userId: number): Promise<string> {
    return this.uploadFile(file, `profiles/${userId}`);
  }

  async uploadProjectDocument(file: File, projectId: number): Promise<string> {
    return this.uploadFile(file, `projects/${projectId}/documents`);
  }

  async uploadTaskAttachment(file: File, taskId: number): Promise<string> {
    return this.uploadFile(file, `tasks/${taskId}/attachments`);
  }

  getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  isImageFile(filename: string): boolean {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  isDocumentFile(filename: string): boolean {
    const documentExtensions = ["pdf", "doc", "docx", "txt", "md"];
    return documentExtensions.includes(this.getFileExtension(filename));
  }

  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }
}

export const storage = StorageService.getInstance();
