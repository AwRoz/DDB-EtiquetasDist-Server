require('dotenv').config({ path: './.env' });
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
const express = require('express');
const cors = require('cors');
const PORT = 3000;
const app = express();
const facturasVentasRouter = require('./routes/mainRouter.js')

app.use(cors());

// Create the connection pool during server startup
console.log(`Creating database connection pool`);
oracledb.createPool(dbConfig).catch((err) => {
  console.error('Error creating connection pool:', err);
  process.exit(1); // Exit the server if the pool creation fails
});

app.use('/documentos', facturasVentasRouter)


process.on('SIGINT', async () => {
  try {
    await oracledb.getPool().close(10);
    console.log('Connection pool closed gracefully.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing connection pool:', err);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});