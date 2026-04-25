export interface FileStorageProvider {
  save(file: Express.Multer.File): Promise<{ url: string; filename: string }>;
}

class LocalFileStorageProvider implements FileStorageProvider {
  async save(file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`
    };
  }
}

export const fileStorageProvider: FileStorageProvider = new LocalFileStorageProvider();
