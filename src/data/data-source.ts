// src/data/data-source.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { RefreshToken } from 'src/tokens/entities/refresh-token/refresh-token';
import { User } from 'src/user/entities/user/user';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgre',
    password: 'Postgre1.',
    database: 'OSYTest',
    synchronize: false,
    // entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
    entities: [RefreshToken, User],
    migrations: [path.join(__dirname, './migrations/*.{ts,js}')],
});
