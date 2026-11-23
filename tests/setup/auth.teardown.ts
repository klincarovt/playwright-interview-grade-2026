import fs from 'fs';
import { z } from 'zod';
import { test as teardown } from '../../src/fixtures';
import { ACCOUNT_FILE } from '../../src/config/paths';

const AccountSchema = z.object({ email: z.string(), password: z.string() });

teardown('delete the setup account', async ({ userClient }) => {
    if (!fs.existsSync(ACCOUNT_FILE)) return;   // setup never created one
    const account = AccountSchema.parse(JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf-8')));
    await userClient.deleteAccount(account.email, account.password);
    fs.rmSync(ACCOUNT_FILE);
});