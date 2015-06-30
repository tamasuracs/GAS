/**
*  Main entry point for the WebApp
*/

function doGet() {
  
  var app = UiApp.createApplication();
  
  
  //Charts - https://developers.google.com/chart/interactive/docs/gallery/barchart
  //           https://google-developers.appspot.com/chart/interactive/docs/gallery/columnchart
  
  //This year
  
    var today = new Date();
    var startDate = new Date();
    startDate.setMonth(0, 1);
    populateCharts("This year", startDate, today, app);
  
  
    //Last year
    /*
    var startDate = new Date(new Date().setYear(new Date().getYear() - 1));
    startDate.setMonth(0, 1);
    var endDate = new Date(new Date().setYear(new Date().getYear() - 1)); 
    populateCharts("Last year until todays calendar day", startDate, endDate, app);
    
    */
  
    //Last year - Lists all the training entries of the whole previous year
    var startDate = new Date(new Date().setYear(new Date().getYear() - 1));
    startDate.setMonth(0, 1);
    var endDate = new Date(new Date().setYear(new Date().getYear() - 1)); 
    endDate.setMonth(11, 31);
    populateCharts("Last year",startDate, endDate, app);
  
    //Last year - Lists all the training entries of the previous year
    var startDate = new Date(new Date().setYear(new Date().getYear() - 2));
    startDate.setMonth(0, 1);
    var endDate = new Date(new Date().setYear(new Date().getYear() - 2)); 
    endDate.setMonth(11, 31);
    populateCharts("Two years ago ",startDate, endDate, app);
  
    return app;  
}

/**
Create the following page elements

- Header + Time frame
- Yearly summary table
- Chart of the weekly training hours
- Chart of the weekly training counts
- Chart of the weekly distances
*/
function populateCharts(title, startDate, endDate, app){
  
  readTrainingDataFromGCalendar(startDate, endDate);
  
  var timeFrame = toDate(startDate)+" - "+toDate(endDate)+" ("+ weeks_between(startDate, endDate)+" weeks)";
  app.add(app.createHTML("<h1>" + title +" - "+timeFrame+"</h1>"));    
    var chartBuilder = Charts.newTableChart().setDimensions(1000, 150);
    chartBuilder.setDataTable(processSportEvents_TC(startDate, endDate));      
    app.add(chartBuilder.build());
  
    var data= getWeeklyStat(startDate, endDate, "weeklyDurations");  
    var columnChart = Charts.newColumnChart();
    columnChart.setDataTable(data);
    columnChart.setDimensions(1000, 300);
    columnChart.setStacked();
    columnChart.setTitle("Weekly Training Hours " + timeFrame);
    app.add(columnChart.build());
  
    var data= getWeeklyStat(startDate, endDate, "weeklyCounts");  
    var columnChart = Charts.newColumnChart();
    columnChart.setDataTable(data);
    columnChart.setDimensions(1000, 300);
    columnChart.setStacked();
    columnChart.setTitle("Weekly Training Counts " + timeFrame);
    app.add(columnChart.build());

    var data= getWeeklyStat(startDate, endDate, "weeklyDistances");  
    var columnChart = Charts.newColumnChart();
    columnChart.setDataTable(data);
    columnChart.setDimensions(1000, 300)
    columnChart.setStacked();
    columnChart.setTitle("Weekly Distances (km) " + timeFrame);
    app.add(columnChart.build());
  
    app.add(app.createHTML("<hr>"));
}


/*
  Retrieves calendar entries from the SPORT calendars and creates summary
  
  column: weeklyDistances
*/
function getWeeklyStat(startDate, endDate, column) {  
  
     var data = Charts.newDataTable()
                  .addColumn(Charts.ColumnType.STRING, "Week");
  
     var result = {};
  
     for(var i=0;i<sportTypes.length;i++){
       var type=sportTypes[i];
       data.addColumn(Charts.ColumnType.NUMBER, type.type);
       
       var week_keys = Object.keys(type[column]);       
       
       for(var j=0;j<week_keys.length;j++){         
         var week_key = week_keys[j];
         
         if(week_key == 'Total')
           continue;
         
         var actual = type[column][week_key];
         
         if(column.indexOf("Duration") > -1){
           actual = (actual / 60);
         }
         
         if(!result.hasOwnProperty(week_key)){
           result[week_key] = new Array(sportTypes.length);
         }
         
         if(result[week_key][i] == undefined || result[week_key][i] == null){
           result[week_key][i] = 0;
         }
         
         result[week_key][i] += actual;
       }// end for week_keys
     }//end for sportTypes
  
     var week_keys = Object.keys(result).sort();       
  
  for(var i=0;i<week_keys.length;i++){
    var week_key = week_keys[i];
    var row_array = result[week_key]; 
    for(var j=0;j<row_array.length;j++){
      if(row_array[j]==undefined || row_array[j] == null){
        row_array[j]=0;
      }
    }
    
    row_array = [ week_key ].concat(row_array);
    data.addRow(row_array); 
  }
  
  
  return data.build();   
}

/*
  Retrieves calendar entries from the SPORT calendars and creates summary Table
*/
function processSportEvents_TC(startDate, endDate) {
  
   var data = Charts.newDataTable()
     .addColumn(Charts.ColumnType.STRING, "Type")
     .addColumn(Charts.ColumnType.STRING, "Wrkts")
     .addColumn(Charts.ColumnType.STRING, "Wrkts/wk")
     .addColumn(Charts.ColumnType.STRING, "Duration (hrs)")
     .addColumn(Charts.ColumnType.STRING, "Duration/wk (hrs)")
     .addColumn(Charts.ColumnType.STRING, "Sum Dst (km)")
     .addColumn(Charts.ColumnType.STRING, "Dst/Mth (km)")
     .addColumn(Charts.ColumnType.STRING, "Dst/wk (km)");
     
    var weeks = weeks_between(endDate, startDate);    

    var sumCnt = 0
    var sumDist = 0;
    var sumDur = 0

    for (var j = 0; j < sportTypes.length; j++) {
        var type = sportTypes[j];
      
        sumDur += type.weeklyDurations.Total;
        sumCnt += type.weeklyCounts.Total;
        sumDist += type.weeklyDistances.Total;
      
        var row = [
                    type.type,
                    type.weeklyCounts.Total.toFixed(2),
                    (type.weeklyCounts.Total / weeks).toFixed(2) ,
                    (type.weeklyDurations.Total/60).toFixed(2),
                    (type.weeklyDurations.Total/weeks/60).toFixed(2),
                    type.weeklyDistances.Total.toFixed(2) ,
                    (type.weeklyDistances.Total / (30 / 7)).toFixed(2),
                    (type.weeklyDistances.Total / weeks).toFixed(2)
                   ];
      
      data.addRow(row);

        type.count = 0;
    }
  
   data.addRow([
                  "SUM",
                  sumCnt.toFixed(2) ,
                  (sumCnt / weeks).toFixed(2),
                  (sumDur/60).toFixed(2),
                  (sumDur/weeks/60).toFixed(2),
                  sumDist.toFixed(2),
                  (sumDist / (30 / 7)).toFixed(2),
                  (sumDist / weeks).toFixed(2)
                ]);

    return data.build();
}

/*
*  Reads the Google Calendar and processes entries btw start and endDate
*/
function readTrainingDataFromGCalendar(startDate, endDate){
  
   var calendarToUse = PropertiesService.getScriptProperties().getProperty("CalendarToUser");
   var sportCalendar = CalendarApp.getCalendarsByName(calendarToUse);
    var events = sportCalendar[0].getEvents(startDate, endDate);
  
    //Resting weekly statistic values
    for(var i=0; i < sportTypes.length; i++){
       sportTypes[i].weeklyCounts = null;
       sportTypes[i].weeklyDistances = null;
       sportTypes[i].weeklyDurations = null;
    }
  
    for (var i = 0; i < events.length; i++) {
      
        var weekSatrt = getMonday(events[i].getStartTime())        
        var weekOfYearLabel = toDate(weekSatrt)
      
        var eventShortDescription = events[i].getTitle();
      
        var typeWasFound = false;

        for (var j = 0; j < sportTypes.length; j++) {
            var type = sportTypes[j];
             
            for (var idx = 0; idx < type.keys.length; idx++) {
                var key = type.keys[idx];
                if (eventShortDescription.toLowerCase().indexOf(key) > -1) {
                    typeWasFound = true;
                    var dst = getDistance(type, eventShortDescription);
                    var dur = getDuration(type, eventShortDescription);
                    increasDistanceAndCount(type, dst, dur, weekOfYearLabel);
                    break;
                }
            }
          
            if(typeWasFound){
               break;
            }
        }

        //If the sport type wasn't found - Other is used
        if (!typeWasFound) {
          increasDistanceAndCount(sportTypes[sportTypes.length - 1], 0, sportTypes[sportTypes.length - 1].defDuration, weekOfYearLabel);
        }
    }
}

/*
* Takes duration from the short description
*/
function getDuration(sportType, eventShortDescription){
    //By default the default distance assigned to the 
    // sport art is taken
    var duration = sportType.defDuration;
  
    // 2h, 2H matched, but 120HR shouldn't
    /*
      1.2ó 
      1ó5p
      1h 
      1h15m      
      140 HR - wrong
      4:15 min/km - wrong
    
    */
  
    var dur_hour_regex = /[^0-9\.oóhOÓH]([0-9\.]+)\s*([oóOÓ]|[hH][^rR])/;    
    //var dur_min_regex = /[^0-9\.\p\m\P\M]([0-9\.]+)\s*(min|[pmPM])[\s]*/;
    var dur_min_regex = /[^0-9\.pmPMxX]([0-9\.]+)\s*(m(?!in)|min(?!\s*\/)|[pP])[\s]*/;
    var dur_hour_match = eventShortDescription.match(dur_hour_regex);
    var dur_min_match = eventShortDescription.match(dur_min_regex);
  
    var dur_hour_match_found = (dur_hour_match && dur_hour_match.length >= 2);

    //If distance is provided in the entry - that value is taken
    if (dur_hour_match_found) {
        var durHour_tmp = parseInt(dur_hour_match[1]);

        if (!isNaN(durHour_tmp)) {
            duration = durHour_tmp * 60;
        }
    }
  
    if (
        dur_min_match && 
        dur_min_match.length >= 2 && 
        dur_min_match[0].indexOf("min/km") == -1 
        ){
        var durMin_tmp = parseInt(dur_min_match[1]);
      
        if (!isNaN(durMin_tmp)) {
          if(dur_hour_match_found){
            duration += durMin_tmp;
          }
          else{
            duration = durMin_tmp;
          }
        }
          var a = 0;
    }  

    return duration;
}

/**
* Parses distance from the passed shortDescription   
*/
function getDistance(sportType, eventShortDescription) {
    //By default the default distance assigned to the 
    // sport art is taken
    var dst = sportType.defDistance;

    var dist_regex = /[^0-9\.,]([0-9\.,]+)\s*[kK][mM]/;
    var distance_matches = eventShortDescription.match(dist_regex);

    //If distance is provided in the entry - that value is taken
    if (distance_matches
       &&
       distance_matches.length == 2) {

        var dst_tmp = parseInt(distance_matches[1]);

        if (!isNaN(dst_tmp)) {
            dst = dst_tmp;
        }
    }
    else {
        if (sportType.distanceFilters != undefined
           &&
           sportType.distanceFilters.length > 0) {

            for (var k = 0; k < sportType.distanceFilters.length; k++) {
                distanceFilter = sportType.distanceFilters[k];

                if (eventShortDescription.toLowerCase().indexOf(distanceFilter.key.toLowerCase()) > -1) {
                    dst = distanceFilter.value;
                    break;
                }
            }//end for
        }//end 
    }//end else 

    return dst;
}

/*
*  Increases a property on the sport type
*
*/
function increaseExpandoProperty(sportType, property, value, weekOfYearLabel){
  if(sportType[property] == undefined || sportType[property] == null ){
      sportType[property] = {};
      sportType[property].Total = 0;
    }
  
    sportType[property].Total += value;
  
    if(!sportType[property].hasOwnProperty(weekOfYearLabel)){
      sportType[property][weekOfYearLabel] = value;
    }else{
      sportType[property][weekOfYearLabel] += value;
    }
}

/*
  Increases the count property on the passed sportType 
  or sets it to 1;
*/
function increasCount(sportType, weekOfYearLabel) {
  increaseExpandoProperty(sportType,"weeklyCounts",1,weekOfYearLabel);
}

/*
  Increases the distance property of the passed sport type;
*/
function increasDistanceAndCount(sportType, distance, duration, weekOfYearLabel) {
    increasCount(sportType, weekOfYearLabel)  
    increaseExpandoProperty(sportType,"weeklyDistances",distance,weekOfYearLabel);
    increaseExpandoProperty(sportType,"weeklyDurations",duration,weekOfYearLabel);   
}


