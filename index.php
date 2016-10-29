<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>How long do they sleep (Interactive)</title>

<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" />
<link rel="stylesheet" href="css/index.css" />

</head>

<body>
<?php include_once("analyticstracking.php") ?>
<!--
Idea from
http://sleepopolis.com/blog/sleep-habits-of-the-animal-kingdom-infographic/
-->

<div id="drawing-container">
  <svg id="drawing">
    <defs id="defs" />
  </svg> 
</div>
<script type="text/javascript" src="js/geometric.js"></script>
<script type="text/javascript" src="js/svg.js"></script>
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/sleep-data.js"></script>
<script type="text/javascript" src="js/svg-options.js"></script>
<script type="text/javascript" src="js/svg-creation.js"></script>
<script>
$(document).ready(function() {
  
  if (!SVG.supported) {
    alert( "No SVG Support");
    return;
  }
  
  // Reset the defaults, tit!
  SVG.defaults.attrs['font-family'] = '';
  SVG.defaults.attrs['font-size'] = '';
  
  // Initialize the SVG library 
  var svg = SVG('drawing').size('100%', '100%')
  
  // Something related to pixels, what ever...
  svg.spof();
  SVG.on(window, 'resize', function() { svg.spof() })
  
  // Now start with creating the background for the SVG
  createBackground(svg, options);
  
  // Now create each arc
  for( var arcIdx = 0; arcIdx < items.length; arcIdx++)
  {
    createArc(svg, items[arcIdx], options, arcIdx);
    
  }
  
});
</script>
<?php include_once("footer.php") ?>
</body>
</html>