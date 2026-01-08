import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { extname } from 'path';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private async processUpload(file: Express.Multer.File, options: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) return reject(error || new Error('Upload échoué'));
        resolve(result);
      });
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const extension = extname(file.originalname); // ex: ".pptx"
    const nameOnly = file.originalname.replace(extension, '');

    // On nettoie le nom pour éviter les caractères bizarres
    const safeName = nameOnly
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]/g, '');

    return this.processUpload(file, {
      folder: 'bngrc_fichiers',
      resource_type: 'raw', // Pour Word/Excel/PPTX
      // 🚀 L'ASTUCE : On définit le public_id SANS l'extension, 
      // mais on utilise 'use_filename' et on laisse Cloudinary gérer.
      // OU on force le public_id avec l'extension directement :
      public_id: `${safeName}-${Date.now()}${extension}`, 
      access_mode: 'public', 
    type: 'upload',
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Aucune image fournie');
    return this.processUpload(file, {
      folder: 'bngrc_avatars',
      resource_type: 'image',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
  }
}