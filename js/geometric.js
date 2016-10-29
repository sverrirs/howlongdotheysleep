/*
Thanks to http://stackoverflow.com/a/18473154/779521
*/
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function arc(x, y, radius, startAngle, endAngle, sweepFlag) {
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = "0";
  if (endAngle >= startAngle) {
    largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  } else {
    largeArcFlag = (endAngle + 360.0) - startAngle <= 180 ? "0" : "1";
  }

  sweepFlag = typeof sweepFlag === 'undefined' ? 0 : sweepFlag;
  var d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(" ");

  return d;
}

/*
Adapted from: http://stackoverflow.com/a/17455686/779521
*/
function radiantLine(centerX, centerY, innerRadius, outerRadius, degrees) {
  var radians = degrees * Math.PI / 180;
  var start = {
    x: centerX + innerRadius * Math.cos(radians),
    y: centerY + innerRadius * Math.sin(radians)
  };

  var end = {
    x: centerX + outerRadius * Math.cos(radians),
    y: centerY + outerRadius * Math.sin(radians)
  }

  var d = [
    "M", start.x, start.y,
    "L", end.x, end.y
  ].join(" ");

  return d;
}