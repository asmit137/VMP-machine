let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    // Dynamically load the backend on the first request to avoid ESM/CommonJS conflicts
    if (!appInstance) {
      const { createApp } = await import('../server/src/app.js'); // Use .js extension for ESM resolution
      appInstance = createApp();
    }
    
    // Pass the request to the Express backend
    return appInstance(req, res);
    
  } catch (err: any) {
    console.error('Vercel Serverless Boot Error:', err);
    
    // Return a clean, human-readable JSON response if the server crashes
    return res.status(500).json({
      success: false,
      code: 'SERVER_BOOT_FAILED',
      error: err.message || 'An unexpected error occurred while starting the backend.',
      message: err.message || 'An unexpected error occurred while starting the backend.',
    });
  }
}
