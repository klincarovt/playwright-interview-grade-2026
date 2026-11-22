import type { User } from '../../types/user';

export const buildUser = (overrides: Partial<User> = {}): User => {
    const id = crypto.randomUUID().slice(0, 8);

    return {
        name: `user-${id}`,
        email: `user-${id}@example.com`,
        password: `Pw-${id}`,
        title: 'Mr',
        birth_date: '1',
        birth_month: '1',
        birth_year: '1990',
        firstname: 'Test',
        lastname: 'User',
        company: 'QA',
        address1: 'Street 1',
        address2: 'Flat 2',
        country: 'India',
        zipcode: '1000',
        state: 'State',
        city: 'City',
         mobile_number: '1234567890',
        ...overrides,
    };
}