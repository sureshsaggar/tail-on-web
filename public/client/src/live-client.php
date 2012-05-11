<?php
	$pathToLogFile = "/var/log/sureshsaggar.log";
	$host = "sureshsaggar.info";
?>
<!DOCTYPE html>
<html>
<head>
	<style type="text/css">
		pre {margin:0}
	</style>
</head>
<body>
	<script src='js/jquery-1.4.4.min.js'></script>
	<fieldset>	
		<legend>Inputs</legend>
		Host: <input id="u_host" type="text" size="100" value="<?php echo $host;?>"/>
		Path to analytics log file: <input id="u_logfile" type="text" size="80" value="<?php echo $pathToLogFile;?>"/>
		<button onclick='sendCommand();'>Start process</button>
	</fieldset>	
	<div id="debug"></div>
	<div id="msg"></div>	
	<script>
		var host = $("#u_host").val();
		var ws = new WebSocket("ws://" + host + ":8001");
		$(document).ready(function() {	
	  		
			/* Define websocket handlers */
      		ws.onmessage = function(evt) {
				$("#msg").append('<pre>' + evt.data + '</pre>');
			};
      		ws.onclose = function() {
				debug("socket closed");
			};
      		ws.onopen = function() {
				debug("connected...");
   			};
		});
		
		function debug(str) {
			$("#debug").append('<pre>' + str + '</pre>');
		};
		
		function sendCommand(){
			var u_logfile = $("#u_logfile").val();
			console.log("User entered path to the log file [" + u_logfile + "]");	
			
			var raw_json = '{"t":"tail", "d":"' + u_logfile + '"}';
			ws.send(raw_json);
		}
		
</script>
</body>
</html>
