import sqlite3 from "sqlite3"
import path from 'path'

const dbPath = path.join(new URL(path.dirname(import.meta.url)).pathname.replace('/', ''), '../../db.sqlite')
console.log(dbPath)
export const db = new sqlite3.Database(dbPath);