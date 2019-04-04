var vers = '59'; // версия tz.swf

function recieveFromFlash(data) {
	if (data == "regfinish") {top.finishRegistration();}
	if (doStop) return;
	var command=data[0];

	var ztmp=new Array();
	for (var i=1;i<data.length;i++) {
		ztmp.push(data[i]);
	}
	var arr=ztmp[0].split('	');
	
	if (command == "R") {top.R(arr[0],arr[1])}
	else if (command == "S") {
		top.S(decode_html(arr[0]), arr[1], arr[2],0,arr[3]);
	}
	else if (command == "Z") top.Z(arr[0],arr[1],arr[2],arr[3],arr[4]);
	else if (command == "A") top.A(ztmp[0])
	else if (command == "D") top.D(ztmp[0]);
	else if (command == "Start") top.StartChat(ztmp[0],ztmp[1],ztmp[2]);
	else if (command == "Stop") top.OnStopChat(ztmp[0]);
	else if (command == "cmd")  {
		top.updateCmd(ztmp[0].split(","));
	}
	else if (command == "info") top.AddTo(ztmp[0], 1)
	else if (command == "alert") top.alert(ztmp[0]);
	else if (command == "vip") top.set_vip(ztmp[0]);
	else if (command == "dealer_logins") top.set_dealerlist(ztmp[0]);
	else if (command == "dealer_sites") top.set_dealerlinks(ztmp[0]);
	else if (command == "fullscreen") top.fullScreen(ztmp[0] == '1');
	else if (command == "ME") document.title="["+arr[1]+"] "+arr[0];
	else if (command == "restart_client") window.location.href = "index.html";
	return true;
}

function initialize() {
	//сообщение от флеша, что он готов передавать и принимать команды
	checkBrowserAndSendData();
}

function checkBrowserAndSendData() {
	var browser="";
	var warnuser = false;
	if (IE) {
		browser ="IE - "+navigator.userAgent;
	} else {
		if (navigator.userAgent.indexOf("Firefox")>-1) {
			browser ="Firefox - "+navigator.userAgent;
		} else if (navigator.userAgent.indexOf("Opera")>-1) {
			var warnuser = true;
			browser ="Opera - "+navigator.userAgent;
		} else {
			browser ="?"+navigator.appName+" - "+navigator.userAgent;
		}
	}
	getFlashElement().browserData(browser);
	
	if (warnuser) {
		alert(top.mes_incorrect_browser);
	}
}

function showBattle(id, lang) {
     win = window.open("emp.html?"+id, "sbtl", "height=400,width=1004,status=0,toolbar=0,menubar=0,location=0,resizable=1");
     setTimeout('showBattle2("'+id+'","'+lang+'")', 500);
}
function showBattle2(id, lang) {
	win.document.write('<html><head><title>'+(top.mes_battle_look || 'Combat review')+' '+id+'</title>'+
	'<script language="JavaScript" src="i/swfobject.js"><\/script>'+
	'<script type="text/javascript"> function Show() { var so = new SWFObject("sbtl.swf", "sbtl", "1004", "400", "7", "#47413A"); so.addParam("allowScriptAccess", "always"); so.addVariable("language", "'+lang+'"); so.addVariable("battleid", "'+id+'"); so.write("battleflash"); } <\/script>'+
	'</head><body leftmargin="0" topmargin="0" marginheight="0" marginwidth="0" bgcolor="#40404A">'+
	'<table border="0" width="100%" height="100%"><tr><td id="battleflash" align="center">&nbsp;</td></tr></table>'+
	'<script language="JavaScript">setTimeout("Show()", 500);<\/script>'+
	'</body></html>');
}

function gKey()
{
	getFlashElement().focus();
	return true;
}
function doExit() {
	doStop = true;
	//getFlashElement().gameLogOut();
}

function decode_utf8(utftext) {
	var plaintext = ""; var i=0; var c=c1=c2=0;
	while(i<utftext.length) {
		c = utftext.charCodeAt(i);
		if (c<128) { plaintext += String.fromCharCode(c); i++; }
		else if ((c>191) && (c<224)) {
			c2 = utftext.charCodeAt(i+1);
			plaintext += String.fromCharCode(((c&31)<<6) | (c2&63));
			i+=2;
		} else {
			c2 = utftext.charCodeAt(i+1); c3 = utftext.charCodeAt(i+2);
			plaintext += String.fromCharCode(((c&15)<<12) | ((c2&63)<<6) | (c3&63));
			i+=3;
		}
	}
	return plaintext;
}

function decode_html(utftext) {
	return utftext.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}