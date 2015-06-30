/*
   Returns the date part as yyyy-mm-dd string of the passed DateTime
*/
function toDate(date)
{
  if(!date)
  {
    date = new Date();
  }
  
  date = date.toISOString().replace('T','_').replace(':','-').replace(':','-');
  date = date.substring(0,date.indexOf("_"));
  return date;
}

/*
 *  Calculates the count of the weeks between two dates
 */
function weeks_between(date1, date2) {
    // The number of milliseconds in one week
    var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);
    // Convert back to weeks and return hole weeks
    return Math.floor(difference_ms / ONE_WEEK);
}

/*
 * Calculates the date of Monday of the week of the passed date
 */
function getMonday(d){
   var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1) +1; // adjust when day is sunday
  return new Date(d.setDate(diff));
}