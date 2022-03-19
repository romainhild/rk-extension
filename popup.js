let startDatePicker = document.getElementById("startDate");
let endDatePicker = document.getElementById("endDate");
let today = new Date();
const dtf = new Intl.DateTimeFormat('en', {year:"numeric",month:"2-digit",day:"2-digit"});
[{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(today);
endDatePicker.value=`${ye}-${mo}-${da}`;

chrome.storage.sync.get(['year','month','day'], function(result) {
    previousDate = new Date(result['year'], result['month'], result['day']);
    [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(previousDate);
    startDatePicker.value=`${ye}-${mo}-${da}`;
});

let getAdress = document.getElementById("getAdress");
getAdress.addEventListener("click", async () => {
    let startDate = startDatePicker.valueAsDate;
    let endDate = endDatePicker.valueAsDate;
    let newDate = new Date(new Date().setDate(endDate.getDate()+1));

    chrome.storage.sync.set({'year': newDate.getFullYear(),
                             'month': newDate.getMonth(),
                             'day': newDate.getDate(),
                             'startYear': startDate.getFullYear(),
                             'startMonth': startDate.getMonth(),
                             'startDay': startDate.getDate(),
                             'endYear': endDate.getFullYear(),
                             'endMonth': endDate.getMonth(),
                             'endDay': endDate.getDate()},
                            function() {
                                chrome.tabs.create(
                                    {url: "https://runkeeper.com/exportData", active: false},
                                    function (tab) {
                                        chrome.runtime.sendMessage({action: "tabCreated"});
                                        window.close();
                                    }
                                );
                            });
});
