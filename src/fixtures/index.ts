import { mergeTests } from '@playwright/test';
import { test as uiTest } from './ui.fixtures';
import { apiTest } from './api.fixtures';

export { expect } from '@playwright/test';
export const test = mergeTests(uiTest, apiTest);    // browser tests: pages + clients
export { apiTest }; // API tests: no browser