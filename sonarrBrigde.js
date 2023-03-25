import * as SonarrAPI from "sonarr-api";
import * as fs from "fs";

const loginFile = fs.readFileSync("sonarr.info");
const data = JSON.parse(loginFile);

const sonarr = new SonarrAPI.default(data);

function getSonarr() {return sonarr};

class Image {

    /**@returns {String} */
    get coverType() {
        return this.coverType;
    }

    /**@returns {String} */
    get url() {
        return this.url;
    }
    /**@returns {String} */
    get remoteUrl() {
        return this.remoteUrl;
    }
}

class SeriesProxy {

    #series;

    constructor(series) {
        this.#series = series
    }

    /**@returns {String} */
    get title() {
        return this.#series.title;
    }

    /**
     * @returns {int}
     */
    get seasonCount() {
        return this.#series.seasonCount;
    }

    get seasons() {
        return this.#series.seasons;
    }

    /**@returns {Image} */
    get poster() {
        let result = null;
        let images = this.#series.images
        for (let i = 0; i < images.length; i++) {
            if (images[i].coverType === "poster") {
                result = images[i];
                break;
            }
        }
        return result;
    }

    /** @returns {String} */
    get overview() {
        return this.#series.overview;
    }

}

/**
 * @param {SonarrAPI} sonarr
 * @param {int} id 
 */
async function getSeries(sonarr, id) {
    let ids = await getAllSeriesId(sonarr);

    let result = await sonarr.get("series/" + ids[id]);
    return new SeriesProxy(result);
}

/**
 * 
 * @param {SonarrAPI} sonarr 
 * @returns {int[]}
 */
async function getAllSeriesId(sonarr) {
    let series = await sonarr.get("series");
    let result = [];
    for (let i = 0; i < series.length; i++) {
        result.push(series[i].id);
    }
    return result;
}

/**
 * 
 * @param {SonarrAPI} sonarr 
 * @param {String} search 
 */
async function lookUpSeries(sonarr, search) {
    let searchTerm = search.replace(" ", "%20").replace(":", "%3A");
    let result = await sonarr.get("series/lookup?term=" + searchTerm);
    return result;
}

/**
 * 
 * @param {SonarrAPI} sonarr 
 * @param {String} search 
 * @param {int} amount 
 * @returns {Promise<SeriesProxy[]>}
 */
async function searchSeriesLimited(sonarr, search, amount) {
    let series = await lookUpSeries(sonarr, search);
    let result = [];
    for (let i = 0; i < amount; i++) {
        result.push(new SeriesProxy(series[i]));
    }
    return result;
}


export { searchSeriesLimited, lookUpSeries, getAllSeriesId, getSeries, getSonarr, SeriesProxy }


