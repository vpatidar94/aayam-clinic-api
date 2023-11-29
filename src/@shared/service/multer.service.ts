import multer from 'multer';

const storage = multer.memoryStorage();
export const upload: multer.Multer = multer({ storage: storage });