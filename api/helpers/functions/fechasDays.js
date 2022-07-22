const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone")
const customParseFormat = require("dayjs/plugin/customParseFormat")
dayjs.extend(utc);
dayjs.extend(customParseFormat);

exports.formatDateDaysPeru = (date) => {
    dayjs.extend(timezone);
    const fechaPeru = dayjs(date).tz("America/Lima").toDate();
    console.log("peru", fechaPeru);
    return fechaPeru;
    // return dayjs(date, "YYYY-MM-DD").utc().toDate();
}

exports.formatDateDays = (date) => {
    return dayjs(date, "YYYY-MM-DD").utc().toDate();
}

exports.formarDateString = (date) => {
    return dayjs(date, "YYYY-MM-DD").utc().format("YYYY-MM-DD");
}

exports.formarDateStringUTCMovil = (date) => {
    return dayjs(date, "DD/MM/YYYY").utc().format("YYYY-MM-DD");
}

exports.formarDateStringUTC = (date) => {
    return dayjs(date).utc().format("YYYY-MM-DD");
}

exports.formarDateStringMoreUnoDay = (date) => {
    return dayjs(date).add(1, "day").utc().format("YYYY-MM-DD");
}

exports.formarDateStringLessUnoDay = (date) => {
    return dayjs(date).subtract(1, "day").utc().format("YYYY-MM-DD");
}

exports.formarDateStrinPeru = (date) => {
    // return dayjs(date).subtract(5, "hour").utc().format("YYYY-MM-DD");
    return dayjs(date).subtract(5, "hour").utc().toDate();
}



