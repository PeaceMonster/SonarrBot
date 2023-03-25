import * as sdk from "matrix-js-sdk";
import * as fs from "fs";
import * as brigde from "./sonarrBrigde.js"



let file = fs.readFileSync("login.info")
let loginData = JSON.parse(file);

const client = sdk.createClient(loginData.login);

const roomID = loginData.roomID;

const sonarr = brigde.getSonarr();

client.on("Room.timeline", (event, room, fromStart) => {
    if (event.getType() !== "m.room.message") return;
    if (room.roomId !== roomID) return;
    if (event.sender.userId === client.getUserId()) return;

    /**@type {String} */
    let body = event.event.content.body;

    if (body.startsWith("!search")) {
        let searchArguments = body.split(" ").slice(1);
        let searchTerm = extractString(searchArguments);
        let number = searchArguments[searchArguments.length - 1];
        sendSearchToChat(sonarr, client, room.roomId, searchTerm, number);
    }

    console.log(body);
});

/**
 * @param {sdk.MatrixClient} client 
 * @param {String} room 
 * @param {brigde.SeriesProxy} serie 
 */
async function sendSerie(client, roomId, serie) {
    const msg = "# " + serie.title + "\n" + serie.overview;
    const formattedMsg = "<hr>\n<h1>" + serie.title + "</h1>\n" + serie.overview;
    /** @type {sdk.IEvent} */
    const content = {
        body: msg,
        msgtype: "m.text",
        format: "org.matrix.custom.html",
        formatted_body: formattedMsg
    }
    client.sendEvent(roomId, "m.room.message", content)
    if (serie.poster !== null) {
        await sendImage(client, roomId, serie.poster.url);
    }

}

/**
 * @param {sdk.MatrixClient} client 
 * @param {String} room
 * @param {String} url 
 */
async function sendImage(client, roomId, url) {
    let imageBlob = await fetch(url).then(res => res.blob());
    let mxcUrl = (await client.uploadContent(imageBlob)).content_uri;
    client.sendImageMessage(roomId, mxcUrl);
}

async function sendSearchToChat(sonarr, client, roomId, search, number) {
    console.log(search);
    brigde.searchSeriesLimited(sonarr, search, number)
    .then(async serie => {
        for (let i = 0; i < serie.length; i++) {
            await sendSerie(client, roomId, serie[i]);
        }
    });
}


client.startClient({initialSyncLimit: 0});

/**
 * 
 * @param {String[]} list 
 * @returns {String}
 */
function extractString(list) {
    if (list[0][list[0].length - 1] === '"' || list[0][list[0].length - 1] === "'") {
        return list[0].substring(1, list[0].length - 1);
    }
    let result = list[0].substring(1);

    for (let i = 1; i < list.length; i++) {
        if (list[i][list[i].length - 1] === '"' || list[i][list[i].length - 1] === "'") {
            result += " " + list[i].substring(0, list[i].length - 1);
            break;
        } else {
            result += " " + list[i];
        }
    }
    return result;
}


