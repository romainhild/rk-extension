chrome.storage.sync.get(['date'], function(result) {
    const dtf = new Intl.DateTimeFormat('en', {year:"numeric",month:"short",day:"2-digit"});
    var startDate = result['date'];
    var today = new Date();
    [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(today);
    var endDate = `${da}-${mo}-${ye}`;
    console.log(startDate+" "+endDate);

    document.getElementById("startDate").value = startDate;
    var endInput = document.getElementById("endDate");
    endInput.value = endDate;
    chrome.runtime.sendMessage({action: "submit"});
    endInput.form.submit();
});
