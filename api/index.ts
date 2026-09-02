import { createApp } from '../server/src/app';

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appInstance) {
      appInstance = createApp();
    }
    
    // Pass the request to the Express backend
    return appInstance(req, res);
    
  } catch (error: any) {
    console.error('Vercel Serverless Boot Error:', error);
    
    // Return a clean, human-readable JSON response if the server crashes
    return res.status(500).json({
      success: false,
      code: 'SERVER_BOOT_FAILED',
      message: error.message || 'An unexpected error occurred while starting the backend.',
    });
  }
}
