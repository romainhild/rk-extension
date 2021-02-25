chrome.storage.sync.get(['startYear','startMonth','startDay','endYear','endMonth','endDay'], function(result) {
    const dtf = new Intl.DateTimeFormat('en', {year:"numeric",month:"short",day:"2-digit"});
    startDate = new Date(result['startYear'], result['startMonth'], result['startDay']);
    [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(startDate);
    document.getElementById("startDate").value = `${da}-${mo}-${ye}`;
    endDate = new Date(result['endYear'], result['endMonth'], result['endDay']);
    [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(endDate);
    var endInput = document.getElementById("endDate");
    endInput.value = `${da}-${mo}-${ye}`;
    chrome.runtime.sendMessage({action: "submit"});
    endInput.form.submit();
});
