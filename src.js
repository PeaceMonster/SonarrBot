import * as sdk from "matrix-js-sdk";
import * as fs from "fs";

let file = fs.readFileSync("login.info")
let loginData = JSON.parse(file);

const client = sdk.createClient(loginData.login);

const roomID = loginData.roomID;

client.on("Room.timeline", (event, room, fromStart) => {
    if (event.getType() !== "m.room.message") return;
    if (room.roomId !== roomID) return;
    if (event.sender.userId === client.getUserId()) return;


    console.log(event.sender.userId);
});

client.startClient({initialSyncLimit: 0});