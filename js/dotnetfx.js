var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var YEAR = DAY * 365;
var fullweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var abbrweek = ["Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Fri.", "Sat."];
var fullmonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var abbrmonths = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]

var fx = function() {};

fx.Number = function() {};

fx.Number.install = function() {
    Number.prototype.days = function() {
        return this * DAY;
    }
    Number.prototype.hours = function() {
        return this * HOUR;
    }
    Number.prototype.minutes = function() {
        return this * MINUTE;
    }
    Number.prototype.seconds = function() {
        return this * SECOND;
    }
    Number.prototype.formatCurrency = function() {
        var amount = '' + this;
        var i = parseFloat(amount);
        if (isNaN(i)) {
            i = 0.00;
        }
        var minus = '';
        if (i < 0) {
            minus = '-';
        }
        i = Math.abs(i);
        i = parseInt((i + .005) * 100);
        i = i / 100;
        s = new String(i);
        if (s.indexOf('.') < 0) {
            s += '.00';
        }
        if (s.indexOf('.') == (s.length - 2)) {
            s += '0';
        }
        s = minus + s;
        return "$" + s;
    }
}

fx.Number.uninstall = function() {
    delete Number.prototype.days;
    delete Number.prototype.hours;
    delete Number.prototype.minutes;
}

String.prototype.stripNonNumerics = function() {
    var number = this;
    return number.replace(/[^0-9.]/gi, "");
}


fx.Number.install();
Date.prototype.hasTime = hasTime;
Date.prototype.addDays = addDays;
Date.prototype.addMinutes = addMinutes;
Date.prototype.addHours = addHours;
Date.prototype.addYears = addYears;
Date.prototype.priorDay = priorDay;
Date.prototype.nextDay = nextDay;
Date.prototype.format = formatDate;
Date.prototype.formatDate = formatDate;
Date.prototype.clone = function() {
    var clone = new Date(this.valueOf());
    return clone;
};
Date.prototype.equals = function(other) {
    return this.valueOf() == other.valueOf();
};

String.prototype.endsWith = function(str) {
    return (this.match(str + "$") == str)
}

String.prototype.startsWith = function(str) {
    return (this.match("^" + str) == str)
}

function addDays(days) {
    /// <summary>
    /// Add days to this date and return the result. 
    /// This function does not mutate the date to which it is applied.
    /// </summary>
    /// <param name="days" type="Number">Number of days to add.  This number can be negative.</param>
    var newDate = this.clone();
    newDate.setMilliseconds((this.getUTCMilliseconds() + DAY * days))
    return newDate;
}

function addMinutes(minutes) {
    var newDate = this.clone();
    newDate.setMilliseconds((this.getUTCMilliseconds() + MINUTE * minutes));
    return newDate;
}

function addHours(hours) {
    var newDate = this.clone();
    newDate.setMilliseconds((this.getUTCMilliseconds() + HOUR * hours));
    return newDate;
}

function addYears(years) {
    var newDate = this.clone();
    newDate.setMilliseconds((this.getUTCMilliseconds() + YEAR * years));
    return newDate;
}

function priorDay(dayName) {
    var date = this.clone();
    while (fullweek[date.getDay()] != dayName) {
        date = date.addDays(-1);
    }
    return date;
}

function nextDay(dayName) {
    var date = this.clone();
    while (fullweek[date.getDay()] != dayName) {
        date = date.addDays(1);
    }
    return date;
}

function hasTime() {
    var d = this;
    return (this.getHours() != 0);
}

function formatDate(formatString) {
    //get components
    var d = this;
    var sd = d.getDate();
    var dd = (sd < 10) ? "0" + sd : sd;
    var daystr = dd.toString();
    var ddd = abbrweek[d.getDay()];
    var dddd = fullweek[d.getDay()];
    var xx = daystr.endsWith("1") ? "st" : daystr.endsWith("2") ? "nd" : daystr.endsWith("3") ? "rd" : "th";
    var yyyy = d.getFullYear();
    var yy = d.getFullYear().toString().substring(2, 4);
    var MMMM = fullmonths[d.getMonth()];
    var MMM = abbrmonths[d.getMonth()];
    var hold = d.getMonth() + 1;
    var MM = hold < 10 ? "0" + hold : hold;
    var tt = (d.getHours() >= 12) ? "pm" : "am";
    var h = (d.getHours() > 12) ? d.getHours() - 12 : d.getHours();
    var hh = (h < 10) ? "0" + h : h;
    var m = d.getMinutes();
    var mm = (m < 10) ? "0" + m : m;
    var s = d.getSeconds();
    return formatString.replace("yyyy", yyyy).replace("yy", yy).replace("hh", hh).replace("h", h).replace("mm", mm).replace("m", m).replace("tt", tt).replace("s", s).replace("dddd", dddd).replace("ddd", ddd).replace("dd", dd).replace(/d([^an])/g, sd + "$1") //Keeps the d in day and Wed from being replaced
    .replace("MMMM", MMMM).replace("MMM", MMM).replace("MM", MM).replace("xx", xx)
}


/*
 * JavaScript Pretty Date
 * Copyright (c) 2008 John Resig (jquery.com)
 * Licensed under the MIT license.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.

function prettyDate(time) {
    var date = parseIso(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 15) return date.formatDate("MM/dd/yyyy");

    return day_diff == 0 && (
    diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 15 && Math.ceil(day_diff / 7) + " weeks ago";
}

function parseIso(time) {
    return new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ").replace(/\..*$/, ""));
}

function fullDate(date) {
    return new Date(date).formatDate("MMMM d, yyyy @ h:mm tt");
}
// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if (typeof jQuery != "undefined") jQuery.fn.prettyDate = function() {
    return this.each(function() {
        var isoDate = jQuery(this).attr("data");
        var date = prettyDate(isoDate);
        var longDate = fullDate(parseIso(isoDate));
        jQuery(this).attr("title", longDate);
        if (date) jQuery(this).text(date);
    });
};


// Add a 'toISOString' function to the Date prototype, or fall back to the native method if exists
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        return this.getUTCFullYear() + '-' + (this.getUTCMonth() + 1).toString().lpad("0", 2) + '-' + this.getUTCDate().toString().lpad("0", 2) + 'T' + this.getUTCHours().toString().lpad("0", 2) + ':' + this.getUTCMinutes().toString().lpad("0", 2) + ':' + this.getUTCSeconds().toString().lpad("0", 2) + '.' + this.getUTCMilliseconds().toString().lpad("0", 3) + "Z";
    };
}

/**
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */
(function(Date, undefined) {
    var origParse = Date.parse,
        numericKeys = [1, 4, 5, 6, 7, 10, 11];
    Date.parse8601 = function(date) {
        var timestamp, struct, minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k;
            (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        } else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };
}(Date));

if (typeof parseQueryString == 'undefined') {
    function parseQueryString(search) {
        var a = search.substr(1).split("&");
        if (a == "") {
            return {};
        }
        var b = {},
            i;
        for (i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) {
                continue;
            }
            b[p[0]] = p[1] == "" ? undefined : decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }
}

if (!String.prototype.lpad) {
    String.prototype.lpad = function(pad, maxLen) {
        pad = pad.toString();
        var str = this.valueOf();
        var padBuffer = [];
        while (str.length + (padBuffer.length * pad.length) < maxLen && str.length + ((padBuffer.length + 1) * pad.length) <= maxLen) {
            padBuffer.push(pad);
        }
        padBuffer.push(str);
        return padBuffer.join("");
    };
}

if (!String.prototype.rpad) {
    String.prototype.rpad = function(pad, maxLen) {
        pad = pad.toString();
        var str = this.valueOf();
        var padBuffer = [];
        while (str.length + (padBuffer.length * pad.length) < maxLen && str.length + ((padBuffer.length + 1) * pad.length) <= maxLen) {
            padBuffer.push(pad);
        }
        padBuffer.unshift(str);
        return padBuffer.join("");
    };
}