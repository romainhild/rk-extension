chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'runkeeper-data.com'},
            })
                        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.pageAction.onClicked.addListener(function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code:'document.getElementById("lastdate").innerHTML'},
            function (result) {
                // check if lastDate <= today
                chrome.storage.sync.set(
                    {date:result},
                    function() {
                        chrome.tabs.create(
                            {url: "https://runkeeper.com/exportData", active: false},
                            function (tab) {
                                setTimeout(checkLoad, 2000);
                            }
                        );
                    }
                )
            }
        )
    })
});

function checkLoad(){
    chrome.tabs.query(
        {status: "complete", url: "https://runkeeper.com/exportData" },
        function (tabs) {
            var find = false;
            for(var i = 0; i < tabs.length && !find; i++){
                if(tabs[i].title =! undefined){
                    chrome.tabs.executeScript(tabs[i].id, {file:"script.js"} );
                    find = true;
                }
            }
            if( !find ) {
                setTimeout(checkLoad, 1000)
            }
        }
    )
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("toto");
        if( request.action == "submit" ) {
            setTimeout(checkLink, 1000, sender);
        }
    }
);

function checkLink(sender) {
    chrome.tabs.reload(sender.tab.id, function() {
        chrome.tabs.executeScript(
            sender.tab.id, {file:'findLink.js'},
            function(result) {
                if(result[0]) {
                    chrome.tabs.remove(sender.tab.id);
                    chrome.tabs.query({url:"http://runkeeper-data.com/"}, function(tabs) {
                        chrome.tabs.executeScript(
                            tabs[0].id,
                            {code:
                             'console.log("'+result[0]+'");'+
                             'var req = new XMLHttpRequest();'+
                             'req.open("POST", "/post", true);'+
                             'req.setRequestHeader("Content-type", "application/json");'+
                             'req.send(JSON.stringify({"link":"'+result[0]+'"}));'
                            }
                        )
                    });
                }
                else {
                    setTimeout(checkLink, 2000, sender);
                }
            }
        )     
    });
};
