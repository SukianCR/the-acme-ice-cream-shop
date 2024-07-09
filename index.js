const express = require("express");
const app = express();
const pg = require("pg");
app.use(express.json());
// app.use(require("morgan")("dev"));
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_ice_cream_shop_db"
);

const PORT = process.env.PORT || 3005;

app.get("/", async (req, res, next) => {
  res.send("The Acme Ice Cream Shop");
});

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors ORDER BY name ASC;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
                  SELECT * FROM flavors WHERE id = $1;  
              `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `
            INSERT INTO flavors(name, is_favorite)
            VALUES($1, $2)
            RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
                    UPDATE flavors
                    SET name = $1, is_favorite = $2, updated_at= now()
                    WHERE id = $3;
                `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `
                    DELETE from flavors WHERE id = $1;  
                `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  app.listen(PORT, () => {
    console.log(`I am listening on port number ${PORT}`);
  });
  await client.connect();
  let SQL = `
        DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
id SERIAL PRIMARY KEY,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
name VARCHAR(255) NOT NULL
);
      `;
  //  await client.query(SQL);
  SQL = `
        INSERT INTO flavors(name, is_favorite) VALUES('strawberry', TRUE);
        INSERT INTO flavors(name, is_favorite) VALUES('chocolate', FALSE);
        INSERT INTO flavors(name, is_favorite) VALUES('vanilla', FALSE);
      `;
  //await client.query(SQL);
  console.log("We just seeded out database");
};

init();
