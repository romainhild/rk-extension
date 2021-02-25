chrome.runtime.onInstalled.addListener(function() {
    let yesterday = new Date(new Date().setDate(new Date().getDate()-1));

    chrome.storage.sync.set({'year': yesterday.getFullYear(), 'month': yesterday.getMonth(), 'day': yesterday.getDate()}, function() {
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if( request.action == "tabCreated" ) {
            setTimeout(checkLoad, 2000);
        }
        else if( request.action == "submit" ) {
            setTimeout(checkLink, 1000, sender);
        }
    }
);

function checkLoad(){
    chrome.tabs.query(
        {status: "complete", url: "https://runkeeper.com/exportData" },
        function (tabs) {
            var find = false;
            for(var i = 0; i < tabs.length && !find; i++){
                chrome.tabs.executeScript(tabs[i].id, {file: 'submitform.js'} );
                find = true;
            }
            if( !find ) {
                setTimeout(checkLoad, 1000)
            }
        }
    )
}

function checkLink(sender) {
    chrome.tabs.reload(sender.tab.id, function() {
        chrome.tabs.executeScript(
            sender.tab.id, {file:"findLink.js"},
            function(result) {
                if(result[0]) {
                    chrome.storage.sync.set({'link': result[0]}, function() {
                        chrome.browserAction.setBadgeText({text:"tot"}, function() {
                        });
                    });
                    chrome.tabs.remove(sender.tab.id);
                }
                else {
                    setTimeout(checkLink, 2000, sender);
                }
            }
        )     
    });
};
