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


getDate : function(timeStamp = Date.now()) {
      var d = new Date(timeStamp);
      return d.yyyyMMddhhmmssfff()
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
Date.prototype.yyyyMMddhhmmssfff = function () {
    var yyyy = this.getFullYear().toString();
    var MM = pad(this.getMonth() + 1,2);
    var dd = pad(this.getDate(), 2);
    var hh = pad(this.getHours(), 2);
    var mm = pad(this.getMinutes(), 2)
    var ss = pad(this.getSeconds(), 2)
    var fff = pad(this.getMilliseconds(),4)
    return yyyy + "/" + MM + "/" + dd + ' ' + hh + ":" + mm + ":" +  ss + "." + fff;
}
