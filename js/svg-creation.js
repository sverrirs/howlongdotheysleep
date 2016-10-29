function createArc(svg, item, options, index){
  
  // DEBUG!
  console.log( item.name );
  
  var safe_name = item.name.toLowerCase().replace(' ','');
  
  // Create half arcs for night and day depending on config
  var sleep = _normalizeSleepConfig(item.sleep);    
  //console.log( sleep );
 
  // Does the animal sleep during the day?
  if( typeof sleep.day !== 'undefined' ) {
    _createHalfArc(svg, item, options, index, sleep.day, safe_name+'-day', -90, 90);
  }
  
  // Does the animal sleep during the night?
  if( typeof sleep.night !== 'undefined' ) {
      _createHalfArc(svg, item, options, index, sleep.night, safe_name+'-night', 90, -90);
  }
  
  // Now create the label and text path for the arc
  _createArcText(svg, item, options, index, "noop", safe_name, 90, -90);
  
  // Setup the hover effects for all the arc elements
  var elementsForName = $("[id^="+safe_name+"]");
  elementsForName.on( "mouseenter",function() {
    elementsForName.addClass('hover');
  });
  elementsForName.on( "mouseleave",function() {
    elementsForName.removeClass('hover');
  });
}

function _convertToMinutesAsNumber( value ){
  if( typeof value === 'number')
    return value * 60;
  
  var makemin = value.substr(value.length-1) === 'h' ? 60 : 1;
  var min = parseFloat(value.substr(0, value.length-1))*makemin;
  return min;
}

function _normalizeSleepConfig( sleep ){
  if(  typeof sleep.day !== 'undefined' ) {
    if( typeof sleep.day === 'number' ){
      sleep.day = { total: _convertToMinutesAsNumber(sleep.day), intervals: 1 };
    } else {
      sleep.day = { total: _convertToMinutesAsNumber(sleep.day.total),
                    intervals: typeof sleep.day.intervals !== 'undefined' 
                               ?_convertToMinutesAsNumber(sleep.day.intervals) 
                               : 1 };
    }
  }
  
  if( typeof sleep.night !== 'undefined' ) {
    if( typeof sleep.night === 'number' ){
      sleep.night = { total: _convertToMinutesAsNumber(sleep.night), intervals: 1 };
    } else {
      sleep.night = { total: _convertToMinutesAsNumber(sleep.night.total),
                      intervals: typeof sleep.night.intervals !== 'undefined'
                                 ? _convertToMinutesAsNumber(sleep.night.intervals)
                                 : 1 };
    }
  }
  
  return sleep;
}

/*
  Draws a half-circle for either night or day, calculates any dash style as well
*/
function _createHalfArc(svg, item, options, index, sleep_period, name_prefix, degree_from, degree_to ) {
  console.log( "index: "+index);
  var radius = options.bg.sunmoon + (index+1) * options.arc.radmin;
  
  // Create a dash style for the sleep pattern
  var dasharray = sleep_period.intervals < 2 
                  ? _calculateNightDayDashArray(item, options, radius, sleep_period, name_prefix) 
                  : _calculateIntervalDashArray(item, options, radius, sleep_period, name_prefix);
  
  console.log( dasharray.join( ", ") );
  
  // Create the arc itself
  var arcName = name_prefix+"-arc";  
  //var arcBgColor = (typeof item.bgcolor !== 'undefined'? "stroke: "+item.bgcolor+";" : "");
  var arcBgColor = "stroke: "+options.colors[index]+";";
  var arcEl = svg.path() // Path will be animated afterwards
                 .addClass('arc')
                 .attr('id', arcName)
                 .attr('style', arcBgColor)
                 .attr('stroke-dasharray', dasharray.join(", "));
  
  // Setup the animation separately as we're dealing with a different return object SVG.FX
  arcEl.attr('val', degree_from)
       .animate(500)
       .attr('val', degree_to)
       .during(function(val){  // val is 0 in the beginning of the animation and 1 at the end
          arcEl.plot(arc(options.center.x, options.center.y, radius, degree_from, val*degree_to));
        });
}

function _calculateNightDayDashArray(item, options, radius, sleep_period, name_prefix ){
  
  var half_circle = (Math.PI * radius);  
  var half_day_in_minutes = options.settings.halfdaymin;
  
  var sleeping_min = sleep_period.total;
  if( sleeping_min > half_day_in_minutes )
    throw "Sleep period cannot be longer than 12 hours";
  
  var asleep = half_circle * (sleeping_min / half_day_in_minutes);
  var awake = half_circle - asleep;
  //return [0, asleep/2, awake, asleep/2];
  
  // Want the ends of night and day to meet up so that the duration is continuous
  if( name_prefix.indexOf('night') !== -1)
    return [0, awake, asleep];
  else
    return [asleep, awake];
}

function _calculateIntervalDashArray(item, options, radius, sleep_period, name_prefix ){
  
  var half_circle = (Math.PI * radius);
  var half_day_in_minutes = options.settings.halfdaymin;
  
  var data = {half_circle : half_circle};
  data.interval_count = sleep_period.total / sleep_period.intervals;
  // How long each sleep is per interval
  data.interval_asleep_min = sleep_period.total / data.interval_count;
  // How long each interval lasts
  data.interval_total_length_min = half_day_in_minutes / data.interval_count;
  // Percent asleep per interval
  data.asleep_per_interval_min = data.interval_asleep_min / data.interval_total_length_min;
  data.awake_per_interval_min = data.interval_total_length_min - data.asleep_per_interval_min;
  
  // How long each interval is on the arc radius  
  var interval_length_circle = half_circle / data.interval_count;
  
  var awake_per_interval_circle = interval_length_circle * data.asleep_per_interval_min;
  var asleep_per_interval_circle = interval_length_circle - awake_per_interval_circle;
  
  // Spacing this out a little bit
  //return [awake_per_interval_circle, asleep_per_interval_circle];
  return [0, asleep_per_interval_circle/2, awake_per_interval_circle, asleep_per_interval_circle/2];
}

function _createArcText(svg, item, options, index, sleep_period, name_prefix, degree_from, degree_to){
  
  // Controls the float of the text within the arc
  //var padding = getRnd(degree_from < 0 ? 360 - degree_from : degree_from,  degree_to < 0 ? 360 - degree_to: degree_to);
  var padding = getRnd(10, 320);
  // controls how the text is rendered by svg, flipped horizontal 
  var sweepFlag = padding > 180 ? 0 : 1;
  
  // This padding adjustment is a hack as the text will be misaligned
  // when being drawn during the day period
  var radius = (padding < 180 ? 21 : options.bg.sunmoon) + (index+1) * options.arc.radmin;
    
  // Create the text, the path will be automatically inserted into the defs part of the svg object  
  var txtName = name_prefix+"-text";
  var isNight = name_prefix.indexOf( 'night' ) !== -1 ? true : false;
  var txtValue = item.name;
  var text = svg.text(txtValue)
                .addClass('svg-text')
                .attr('id', txtName)
                .attr('style',(typeof item.fgcolor !== 'undefined'? "fill: "+item.fgcolor+";" : ""))
                .path(arc(options.center.x, options.center.y, radius+options.text.padding, isNight? degree_to : degree_from+padding, isNight? degree_from : degree_to+padding, sweepFlag ))
                .attr("startOffset", "50%")
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRnd(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
  Creates the background for the image, day, night and the default text
*/
function createBackground( svg, options ){
  // Create the radial line paths
  for (var deg = 0; deg < 360; deg += 15) 
  {
    svg.path( radiantLine(options.center.x, options.center.y, 0, options.size/2, deg) )
      .addClass('ray')
      .attr('id', 'radiant' + deg );
  }
  
  // Now create each day portion, filled arcs
  svg.path(arc(options.center.x, options.center.y, options.size/2, -90, 90))
     .addClass('day-arc')
     .attr('id', "bg-day-arc");
  
  svg.path(arc(options.center.x, options.center.y, options.bg.sunmoon, -90, 90))
     .addClass('sun-arc')
     .attr('id', "bg-sun-arc");
  
  svg.path(arc(options.center.x, options.center.y, options.size/2, 90, -90))
     .addClass('night-arc')
     .attr('id', "bg-night-arc");
  
  svg.path(arc(options.center.x, options.center.y, options.bg.sunmoon, 90, -90))
     .addClass('moon-arc')
     .attr('id', "bg-moon-arc");  
}