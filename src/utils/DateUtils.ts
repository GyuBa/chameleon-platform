export class DateUtils {
    static getConsoleTime(date = new Date()) {
        let month = date.getMonth() + 1 as any;
        let day = date.getDate() as any;

        let hours = date.getHours() as any;
        let minutes = date.getMinutes() as any;
        let seconds = date.getSeconds() as any;

        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
}
