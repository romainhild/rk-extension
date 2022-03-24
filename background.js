chrome.runtime.onInstalled.addListener(() => {
    const confURL = chrome.runtime.getURL('conf.json');
    fetch(confURL)
    .then((response) => {return response.json()})
    .then((json) => {    
        // Page actions are disabled by default and enabled on select tabs
        chrome.action.disable();
    
        // Clear all rules to ensure only our expected rules are set
        chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
            // Declare a rule to enable the action on example.com pages
            let exampleRule = {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostEquals: json["url"] },
                    })
                ],
                actions: [new chrome.declarativeContent.ShowAction()],
            };
    
            // Finally, apply our new array of rules
            let rules = [exampleRule];
            chrome.declarativeContent.onPageChanged.addRules(rules);
        }); 
    })
    .catch((error) => { console.log("conf.json should contain the url\n"+error.message); });

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
        return true;
    }
);

function checkLoad(){
    chrome.tabs.query(
        {status: "complete", url: "https://runkeeper.com/exportData" },
        function (tabs) {
            var found = false;
            for(var i = 0; i < tabs.length && !found; i++){
                chrome.scripting.executeScript({target:{tabId:tabs[i].id}, files:['submitform.js']});
                found = true;
            }
            if( !found ) {
                setTimeout(checkLoad, 1000)
            }
        }
    )
}

function checkLink(sender) {
    chrome.tabs.reload(sender.tab.id, function() {
        chrome.scripting.executeScript(
            {target:{tabId:sender.tab.id}, files:['findLink.js']},
            function(result) {
                if(result[0]["result"]) {
                    useLink(result[0]["result"], sender.tab.id);
                }
                else {
                    setTimeout(checkLink, 2000, sender);
                }
            });
    });
};

function useLink(link, tabId) {
    chrome.tabs.remove(tabId);
    const confURL = chrome.runtime.getURL('conf.json');
    fetch(confURL)
    .then((response) => {return response.json()})
    .then((json) => {
        fetch("https://"+json["url"]+"/update", {
            method: "POST",
            headers: {'Content-Type': 'text/plain'}, 
            body: link
        })
        .then((response) => { 
            if( response.status == 200 ) {
                setTimeout(reloadTabs, 3000);
            } else {
                console.log(response.statusText);
            }
            return response.text();
        })
        .then((response) => { console.log(response); })
        .catch((error) => { console.log(error.message)});
    });
}

function reloadTabs() {
    chrome.tabs.query(
        {title:"Runkeeper Data"},
        function(tabs) {
            for(var i = 0; i < tabs.length; i++){
                chrome.tabs.reload(tabs[i].id);
            }
        }
    );
}