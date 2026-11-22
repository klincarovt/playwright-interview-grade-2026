import path from 'path';

export const ROOT_DIR = path.resolve(__dirname, '..', '..');

export const ENVIRONMENTS_DIR = path.join(ROOT_DIR, 'config', 'environments');
export const envFile = (name: string): string => path.join(ENVIRONMENTS_DIR, `${name}.json`);
export const DOTENV_FILE = path.join(ROOT_DIR, '.env');
export const ROUTES_FILE = path.join(ROOT_DIR, 'config', "routes.json");
export const AUTH_DIR = path.join(ROOT_DIR, 'playwright', '.auth');
