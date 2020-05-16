links = Array.from(document.links).map(a => a.href);
var date = new Date().toISOString().split('T')[0];

links.find(function(a) {
    // return a.search("runkeeper-data-export-2020-05-01") > 0;
    return a.search("runkeeper-data-export-"+date) > 0;
})
