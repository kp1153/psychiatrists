import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/schema.js',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: 'libsql://psychiatrist-kamtatiwari.aws-ap-south-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYwMDU0NzcsImlkIjoiMDE5ZDgyMmMtOTQwMS03Mjg4LWFiMDItNjZkMDI3MWQxMjUxIiwicmlkIjoiYjFmODM5ZjItOWY2Ni00MjY4LTllNGQtOWFlYTY5NmFmMzdhIn0.IZy9y5p6PVIN7D-xk5tgpSvkPB2ia3KCtJsivxHzt3Hh_v9odEsmJXywDL5b5oNeMgW7lEmZ9q4Qui-sQxIYBQ',
  },
});