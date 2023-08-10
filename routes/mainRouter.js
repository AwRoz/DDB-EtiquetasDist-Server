const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');


// Middleware to handle async errors
const asyncMiddleware = (handler) => (req, res, next) => {
  handler(req, res).catch(next);
};

router.get('/', asyncMiddleware(async (req, res) => {
  const connection = await oracledb.getConnection();
  const documento = req.query.documento
  const serie = req.query.serie

  console.log(`Accessing main router: ${serie} ${documento}`);

  try {
    let query, queryParams
    if (serie === 'FE'){
      query = `
        SELECT * FROM LIBRA.DDB_APP_FAC_ALB
        WHERE NUMERO_FACTURA = :documento AND SERIE_FACTURA = :serie AND ROWNUM = 1 ORDER BY EJERCICIO_FACTURA DESC`;
    }else if(serie === 'REM'){
      query = `
        SELECT * FROM LIBRA.DDB_APP_FAC_ALB
        WHERE NUMERO_ALBARAN = :documento AND SERIE_ALBARAN = :serie AND ROWNUM = 1 ORDER BY EJERCICIO_ALBARAN DESC`
    }else if(serie === 'PED' || serie === 'CON'){
      query = `
        SELECT * FROM LIBRA.DDB_APP_PEDIDOS
        WHERE NUMERO_PEDIDO = :documento AND SERIE_PEDIDO = :serie AND ROWNUM = 1 ORDER BY EJERCICIO_PEDIDO DESC`
    }
    //better to use named parameters to avoid sql injection
    queryParams = {documento, serie} 
    const result = await connection.execute(query, queryParams);

    if (result.rows && result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('No se encontraron registros');
    }
  } catch (err) {
    console.error(`Error executing the query in 'facturas_albaranes router': ${err} `);
    res.status(500).send(`Ha ocurrido un error al tratar de obtener los datos`);
  } finally {
    try {
      await connection.close();
    } catch (err) {
      console.error('Error closing connection to LIBRA DB:', err);
    }
  }
}
));

module.exports = router;