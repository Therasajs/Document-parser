import express, { Request, Response } from 'express';
import multer from 'multer';
import { ImportService } from '../services/importService';
import { ParsingService } from '../parsers/parsingService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/documents/upload
 * Upload and import file
 */
router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { originalname, buffer } = req.file;

      const summary = await ImportService.importFile(originalname, buffer);

      res.status(200).json({
        success: true,
        message: 'Import completed',
        ...summary
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * POST /api/documents/preview
 * Preview file without importing
 */
router.post(
  '/preview',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { originalname, buffer } = req.file;
      const rows = await ParsingService.parseFile(originalname, buffer);

      res.status(200).json({
        success: true,
        fileName: originalname,
        fileType: originalname.split('.').pop(),
        totalRows: rows.length,
        preview: rows.slice(0, 5)
      });
    } catch (error) {
      console.error('Preview error:', error);
      res.status(500).json({
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;
