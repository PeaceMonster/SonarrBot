import * as bridge from "./sonarrBrigde.js";


const sonarr = bridge.getSonarr();

bridge.searchSeriesLimited(sonarr, "Gravity Falls", 3)
    .then(resultList => {
        for (let i = 0; i < resultList.length; i++) {
            console.log("---");
            console.log(resultList[i].title);
            console.log(resultList[i].overview);
            if (resultList[i].poster !== null) {
                console.log(resultList[i].poster.url);
            } else {
                console.log("No poster");
            }
            console.log("---\n");
        }
});
