const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

//API 1:

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
  SELECT
        *
    FROM
        cricket_team
    ORDER BY
        player_id;`;
  const getPlayers = await db.all(getPlayersQuery);
  res.send(getPlayers);
});

//API 2
app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playersQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES (${playerName},${jerseyNumber},${role});`;

  const DbResponse = await db.run(playersQuery);
  const playerId = DbResponse.lastId;
  res.send({ playerId: playerId });
  console.log("player added to team");
});
// node app.js
