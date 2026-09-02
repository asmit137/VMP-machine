let appInstance: any = null;

export default async function (req: any, res: any) {
  if (!appInstance) {
    const { createApp } = await import('../server/src/app');
    appInstance = createApp();
  }
  return appInstance(req, res);
}
