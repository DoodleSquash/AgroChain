import { Request, Response } from 'express';
import { supabase, BUCKET } from '../utils/supabase';
import { randomUUID } from 'crypto';

// POST /api/upload
// Accepts multipart/form-data with field "file"
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ error: 'No file provided. Use field name "file".' });
      return;
    }

    const ext      = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${randomUUID()}.${ext}`;
    const folder   = (req.query.folder as string) || 'general';
    const path     = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    res.status(201).json({ url: data.publicUrl, path });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
