//=========================================
// Name: mDates
// Description: Date Utils
// Author: jeffreybarron.com
// Methods:
//  getDate()
//=========================================

//=========================================
// Public Functions
module.exports = {

  getDate : function() {
      var d = new Date();
      return d.YYYYMMDDHHMMSSMMMM()
  }

}

//=========================================
// Private Functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

Date.prototype.YYYYMMDDHHMMSSMMMM = function () {
    var YYYY = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var DD = pad(this.getDate(), 2);
    var HH = pad(this.getHours(), 2);
    var MM = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)
    var mmmm = pad(this.getMilliseconds(),4)
    return YYYY + MM + DD + '_' + HH + ":" + MM + ":" +  ss + "." + mmmm;
}
