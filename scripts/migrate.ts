import mysql, { Connection } from 'mysql2/promise'
import path from 'node:path'
import fs from 'node:fs'
import Postgrator from 'postgrator'

interface PostgratorResult {
  rows: any;
  fields: any;
}

async function doMigration (): Promise<void> {
  const connection: Connection = await mysql.createConnection({
    multipleStatements: true,
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  })

  try {
    const migrationDir = path.join(import.meta.dirname, '../migrations')

    if (!fs.existsSync(migrationDir)) {
      throw new Error(
        `Migration directory "${migrationDir}" does not exist. Skipping migrations.`
      )
    }

    const postgrator = new Postgrator({
      migrationPattern: path.join(migrationDir, '*'),
      driver: 'mysql',
      database: process.env.MYSQL_DATABASE,
      execQuery: async (query: string): Promise<PostgratorResult> => {
        const [rows, fields] = await connection.query(query)
        return { rows, fields }
      },
      schemaTable: 'schemaversion'
    })

    await postgrator.migrate()

    console.log('Migration completed!')

    await new Promise<void>((resolve, reject) => {
      connection.end((err: unknown) => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    })
  } catch (error) {
    console.error(error)
  } finally {
    await connection.end()
  }
}

doMigration()