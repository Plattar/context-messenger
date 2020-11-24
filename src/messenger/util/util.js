class Util {

    // generate a quick, random ID thats useful for message digests and class checks
    static id() {
        return Math.abs(Math.floor(Math.random() * 10000000000000));
    }
}

module.exports = Util;