// app.js
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "goodsay",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const say = express();
const port = 3000;

var corsOptions = {
  origin: "https://cdpn.io",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

say.use(express.json());
say.use(cors(corsOptions));

// 수정
say.patch("/says/:id", async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(
    `
    SELECT *
    FROM saytable
    WHERE id=?
    `,
    [id]
  );

  if (rows.length == 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const { regDate, str, author } = req.body;

  if (!str) {
    res.status(404).json({
      msg: "str not found",
    });
    return;
  }

  if (!author) {
    res.status(404).json({
      msg: "author not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE saytable
    SET regDate=?
    str=?
    author=?
    WHERE id=?
    `,
    [regDate, str, author, id]
  );
});

say.patch("/says/g/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    `
    UPDATE saytable
    SET good = good+1
    WHERE id=?
    `,
    [id]
  );

  res.json({
    msg: `수정되었습니다.`,
  });
});

say.patch("/says/h/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query(
    `
    UPDATE saytable
    SET hate = hate+1
    WHERE id=?
    `,
    [id]
  );

  res.json({
    msg: `수정되었습니다.`,
  });
});

//생성
say.post("/says/p", async (req, res) => {
  const { str, author, good, hate } = req.body;

  const [rows] = await pool.query(
    `
      INSERT INTO saytable
      SET regDate = NOW(),
      str = ?,
      author = ?,
      view = 0,
      good = 0,
      hate = 0
      `,
    [str, author, good, hate]
  );

  res.json({
    msg: `명언이 생성되었습니다.`,
  });
});

//삭제
say.delete("/says/d/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(`SELECT * FROM saytable WHERE id = ?`, [id]);

  if (rows.length == 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    DELETE FROM saytable
    WHERE id =?
    `,
    [id]
  );

  res.json(`${id}번이 삭제되었습니다.`);
});

// 랜덤 조회
say.get("/says/rand/", async (req, res) => {
  const [[rows]] = await pool.query(
    `  
    SELECT *
    FROM saytable
    ORDER BY RAND()
    LIMIT 1`
  );

  await pool.query(
    ` 
    UPDATE saytable
      SET view = view +1
      WHERE id =?
      `,
    [rows.id]
  );
  res.json([rows]);
  rows.view++;
});

//단건 조회
say.get("/says/:id", async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.query(
    `
  SELECT * 
  FROM saytable 
  WHERE id=?
  `,
    [id]
  );

  if (rows.length == 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }
  res.json(rows[0]);
});

// 다건 조회
say.get("/says/", async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM saytable ORDER BY id ASC`);

  res.json(rows);
});

say.listen(port);
