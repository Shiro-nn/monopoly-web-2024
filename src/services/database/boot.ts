import knex from "knex";
import config from "../../config";

const checkDatabaseExists = async (pg: knex.Knex<any, unknown[]>, dbName: string) => {
    try {
        const result = await pg.raw(
            `SELECT 1 FROM pg_database WHERE datname = ?`,
            [dbName]
        );

        return result.rows.length > 0;
    } catch (error) {
        return false;
    }
};

const createDatabase = async (pg: knex.Knex<any, unknown[]>, dbName: string) => {
    try {
        await pg.raw(`CREATE DATABASE "${dbName}"`);
        console.log(`Database "${dbName}" created successfully.`);
    } catch (error) {
        console.error('Error creating database:', error);
    }
};

const safeCreateDatabase = async (pg: knex.Knex<any, unknown[]>) => {
    const url = new URL(config.postgres);
    const database = url.pathname.substring(1);

    if (await checkDatabaseExists(pg, database)) {
        return;
    }

    const pg2 = knex({
        client: 'pg',
        connection: {
            host: url.hostname,
            port: parseInt(url.port),
            user: url.username,
            password: url.password,
        },
    });

    await createDatabase(pg2, database);
}


const createTables = async (pg: knex.Knex<any, unknown[]>) => {
    if (!await pg.schema.hasTable('users')) {
        await pg.schema.createTable("users", (table) => {
            table.increments('id').primary();
            table.double('rate').defaultTo(0);
            table.string('email').notNullable();
            table.text('pwd').notNullable();
            table.string('name').notNullable();
            table.integer('inviter').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
        });
    }

    if (!await pg.schema.hasTable('notes')) {
        await pg.schema.createTable("notes", (table) => {
            table.increments('id').primary();
            table.integer('owner').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.string('title').notNullable();
            table.string('desc').notNullable();
            table.dateTime('time').notNullable();
        });
    }

    if (!await pg.schema.hasTable('friends')) {
        await pg.schema.createTable("friends", (table) => {
            table.increments('id').primary();
            table.integer('owner').unsigned().references('id').inTable('users').onDelete('CASCADE');
        });

        await pg.raw('alter table friends\n' +
            '    add list integer ARRAY default ARRAY[]::INTEGER[];');
    }

    if (!await pg.schema.hasTable('comments')) {
        await pg.schema.createTable("comments", (table) => {
            table.increments('id').primary();
            table.integer('owner').unsigned().references('id').inTable('users').onDelete('CASCADE');
            table.integer('note').unsigned().references('id').inTable('notes').onDelete('CASCADE');
            table.dateTime('time').notNullable();
            table.string('text').notNullable();
        });
    }
}

export default Init;

async function Init(pg: knex.Knex<any, unknown[]>) {
    await safeCreateDatabase(pg);
    await createTables(pg);
}