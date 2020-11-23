class Util {

    // generate a quick, random ID thats useful for message digests and class checks
    static id() {
        return Math.abs(Date.now() & Math.floor(Math.random() * 1000000000000000000));
    }
}

module.exports = Util;