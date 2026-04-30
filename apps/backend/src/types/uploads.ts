export interface UploadedFile {
  filename: string;
  originalname: string;
}

export type RequestWithFile = {
  file?: UploadedFile;
};
