var download_unlimited = {
	step : 19*1024*1024,  //19mb
	active : false,

onLoad: function() {
		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("download_unlimited-strings");
	},

myFunction: function (){
		var MyMenu = document.getElementById("download_unlimited-activate");
		MyMenu.label = "Deactivate"; 
		
		//Firebug.Console.log("load");
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(download_unlimited.myObserver, "http-on-modify-request", false);
		download_unlimited.popup("loaded");

	},
myFunction_unreg : function (){
		var MyMenu = document.getElementById("download_unlimited-activate");
		MyMenu.label = "Activate"; 
		download_unlimited.popup("unloaded");
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		try{
			observerService.removeObserver(download_unlimited.myObserver, "http-on-modify-request");
		}catch(e){}
	},
	
	
popup: function (text) {  
		try {  
			Components.classes['@mozilla.org/alerts-service;1'].  
			getService(Components.interfaces.nsIAlertsService).  
			showAlertNotification(null, "Download Unlimited", text, false, '', null);  
		} catch(e) {  
			// prevents runtime error on platforms that don't implement nsIAlertsService  
		}  
	},  
onMenuItemCommand: function(e) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
		var myPanelImage = document.getElementById("download_unlimited-barpanel");
		if(download_unlimited.active == false){
			var txt = prompt("Enter the download limit in MB.","(Enter 50 for 50MB)"); 
			var numericExpression = /^[0-9]+$/;
			if (txt.match(numericExpression)){
				download_unlimited.step = parseInt(txt)*(1024*1024);
			}else{
				alert("Only enter the no of MBs. Do NOT enter MB or any other leters");
				return;
			}
			alert("Download limit is set to "+txt+"MB.");
			download_unlimited.myFunction();
			download_unlimited.active = true;
			myPanelImage.setAttribute("image","chrome://download_unlimited/skin/on.png");
			myPanelImage.setAttribute("tooltiptext","Unlimited Downloads is active. Click here to deactivate it.");
		}else{
			download_unlimited.myFunction_unreg();
			download_unlimited.active = false;
			myPanelImage.setAttribute("image","chrome://download_unlimited/skin/off.png");
			myPanelImage.setAttribute("tooltiptext","Unlimited Downloads is inactive. Click here to activate it.");
		}									
	},

onToolbarButtonCommand: function(e) {
		// just reusing the function above.
		download_unlimited.onMenuItemCommand(e);
	},
	myObserver : {
observe: function(aSubject, aTopic, aData){			  				
			var httpChannel = aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
			try{
				// if the range header is set by the downloadThemAll 
				var range = httpChannel.getRequestHeader('Range');
				lowRange = range.substring(6,range.length-1);
				var upRange = parseInt(lowRange) + download_unlimited.step;
				//change it to the allowed range
				httpChannel.setRequestHeader('Range','bytes='+lowRange+'-'+upRange,false);
				range = httpChannel.getRequestHeader('Range');
			}catch(e){
				//if the range header is not set(normal trafic or data on the page)
				// since they also need to be limited to bypass the limit
				httpChannel.setRequestHeader('Range','bytes=0-'+ download_unlimited.step,false);
				// this may trucate large files but it will be allowed to be downloaded from the addon
			}
		},

QueryInterface: function(iid){
			if (!iid.equals(Components.interfaces.nsISupports) &&
					!iid.equals(Components.interfaces.nsIObserver))
			throw Components.results.NS_ERROR_NO_INTERFACE;

			return this;
		}
	}
};

window.addEventListener("load", function () { download_unlimited.onLoad(); }, false);
