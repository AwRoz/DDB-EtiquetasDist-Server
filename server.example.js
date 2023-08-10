require('dotenv').config({path:'./.env'}) 
const oracledb = require('oracledb')
const dbConfig = require('./dbconfig.js')
const express = require('express')
const cors = require('cors')
const PORT = 3000;
const app = express()

app.use(cors());

app.get('/facturas', async (req, res) => { 
  try{
    await oracledb.createPool(dbConfig)
    let connection
  
    try{
      connection = await oracledb.getConnection(dbConfig)
      const query = `
        SELECT FECHA_FACTURA FROM LIBRA.FACTURAS_VENTAS 
        WHERE NUMERO_FACTURA = '123' AND NUMERO_SERIE = 'FE' AND ROWNUM = 1`

      const result = await connection.execute(query);
      
      if(result.rows && result.rows.length > 0){
        res.status(200).send(result.rows);
      }else{
        res.status(404).send('No se encontraron registros');
      }
  
    }catch(err){
      const errorMessage = `Error conectando a LIBRA DB: ${err}`
      console.log(`Error connecting to LIBRA DB: ${err}`);
      res.status(500).send(errorMessage);
  
    }finally{
      if(connection){
        try{
          await connection.close()
        }catch(err){
          console.log(`Error closing connection to LIBRA DB: ${err}`)
        }
      }
    }
  }catch(err){
    console.log(`Error creating connection pool: ${err}`)
    res.status(500).send(`Error creating connection pool: ${err}`)
  }finally{
    await oracledb.getPool().close(0)
  }

})


app.listen(
  PORT,
  () => console.log(`Server running on: http://localhost:${PORT}`)
)