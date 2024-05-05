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

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
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
  res.send(
    getPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2
app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playersQuery = `
    INSERT INTO 
        cricket_team (player_name,jersey_number,role)
    VALUES 
        ('${playerName}',${jerseyNumber},'${role}');`;

  const DbResponse = await db.run(playersQuery);
  const playerId = DbResponse.lastId;
  //   res.send({ playerId: playerId });
  res.send("Player Added to Team");
});
// node app.js

// API 3

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};

     `;

  const getPlayer = await db.get(getPlayerQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  res.send(
    getPlayer.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
// API 4
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team 
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE 
        player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

// API 5
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team 
    WHERE 
        player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
